const pool = require('../../config/pg.config.js');
const { DuplicateException } = require('../../exceptions/validation.exception.js');

class UsersRepository{

    constructor() {
        this.pool = pool
    }

    async findAll(filters = {}, limit = 10, page = 1, sort = 1) {
        try{
            const offset = (page - 1) * limit
    
            let name;
            let last_name;
            let email;
    
            if(filters.name){
                name = filters.name;
                delete filters.name;
            }
    
            if(filters.last_name){
                last_name = filters.last_name;
                delete filters.last_name;
            }
    
            if(filters.email){
                email = filters.email;
                delete filters.email;
            }
            
            const filterKeys   = Object.keys(filters)
            const filterValues = Object.values(filters)
    
            // WHERE para la query de datos: los filtros arrancan en $3 (después de limit y offset)
            let dataWhere = filterKeys.length > 0
                ? 'WHERE ' + filterKeys.map((key, i) => `${key} = $${i + 3}`).join(' AND ')
                : ''
    
            // WHERE para el COUNT: los filtros arrancan en $1 (no hay limit ni offset antes)
            let countWhere = filterKeys.length > 0
                ? 'WHERE ' + filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')
                : ''
    
            if(name){
                dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}name ILIKE $${filterKeys.length + 3}`; 
                countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}name ILIKE $${filterKeys.length + 1}`
                filterKeys.push("name");
                filterValues.push(`%${name}%`);
            }
    
            if(last_name){
                dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}last_name ILIKE $${filterKeys.length + 3}`; 
                countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}last_name ILIKE $${filterKeys.length + 1}`
                filterKeys.push("last_name");
                filterValues.push(`%${last_name}%`);
            }
    
            if(email){
                dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}email ILIKE $${filterKeys.length + 3}`; 
                countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}email ILIKE $${filterKeys.length + 1}`
                filterKeys.push("email");
                filterValues.push(`%${email}%`);
            }
    
            const [dataResult, countResult] = await Promise.all([
                this.pool.query(
                    `SELECT * 
                    FROM users
                    ${dataWhere}
                    ORDER BY ${sort && sort? `last_name ${sort > 0 ? 'ASC' : 'DESC'}` : 'id ASC'}
                    LIMIT $1 OFFSET $2
                    `,
                    [limit, offset, ...filterValues]
                ),
                this.pool.query(
                    `SELECT COUNT(*) FROM users ${countWhere}`,
                    filterValues
                )
            ])
            const totalDocs  = parseInt(countResult.rows[0].count)
            const totalPages = Math.ceil(totalDocs / limit)
    
            return {
                payload: dataResult.rows,
                totalDocs,
                totalPages,
                page,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }
        }catch(error){
            throw error
        }
    }

    // findByID también con JOIN
    async findById(id) {
        const result = await this.pool.query(
            `SELECT * FROM users 
             WHERE id = $1`,
            [id]
        )
        return result.rows[0] ?? null;
    }

    async existByID(id) {
        const result = await this.pool.query(
            `SELECT 1 FROM users WHERE id = $1`,
            [id]
        )
        return result.rowCount > 0;
    }

    async findUserByEmail(email) {
        const result = await this.pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        )
        return result.rows[0] ?? null;
    }

    async create(data) {
        try {
            const keys   = Object.keys(data)
            const values = Object.values(data)
    
            // Genera: ($1, $2, $3, ...)
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
            const columns      = keys.join(', ')
    
            const result = await this.pool.query(
                `INSERT INTO users (${columns})
                 VALUES (${placeholders})
                 RETURNING *`,
                values
            )
            return result.rows[0]
        } catch (error) {

            if (error.code === '23505') {
                throw new DuplicateException("Email Duplicado");
            }

            throw error;
        }
    }

    async update(id, data) {
        try{
            const keys   = Object.keys(data)
            const values = Object.values(data)
    
            // Genera: title = $1, price = $2, ...
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')
    
            const result = await this.pool.query(
                `UPDATE users
                 SET ${setClause}
                 WHERE id = $${keys.length + 1}
                 RETURNING *`,
                [...values, id]
            )
    
            return result.rows[0] ?? null
        }catch(error){
            throw error
        }
    }

    async updateLastConnection(userId) {
        await this.pool.query(
            `UPDATE users SET last_connection = NOW() WHERE id = $1`,
            [userId]
        );
    }

    async delete(id) {
        try{
            const result = await this.pool.query(
                `DELETE FROM users
                 WHERE id = $1
                 RETURNING *`,
                [id]
            )
            return result.rows[0] ?? null
        }catch(error){
            throw error
        }
    }

}

module.exports = UsersRepository;