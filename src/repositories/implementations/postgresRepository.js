// src/repositories/PostgresRepository.js
const pool = require('../../config/pg.config.js')
const IRepository = require('../base/IRepository.js')

class PostgresRepository extends IRepository {

    constructor(tableName) {
        super()
        this.tableName = tableName
        this.pool = pool
    }

    async findAll() {
        const result = await this.pool.query(
            `SELECT * FROM ${this.tableName}`
        )
        return result.rows
    }

    async findPaginate(query = {}, limit = 10, page = 1, sort = {}) {
        const offset = (page - 1) * limit

        const filterKeys = Object.keys(query)
        const sortKeys   = Object.keys(sort)

        let whereClause = '';

        if(filterKeys.length > 0) {
            whereClause = filterKeys.map((key, i) => `${key} = $${i + 3}`).join(' AND ');
        }

        /* const sortClause  = sortKeys.length > 0 ? 'ORDER BY ' + sortKeys.map((key, i) => `${key} ${sort[key] > 0 ? 'ASC' : 'DESC'}`).join(', ') : '' */

        const [dataResult, countResult] = await Promise.all([
            this.pool.query(
                `SELECT * FROM ${this.tableName}
                ${filterKeys.length > 0 ? `WHERE ${whereClause}` : ''}
                LIMIT $1 OFFSET $2`,
                [limit, offset, ...Object.values(query)]
            ),
            this.pool.query(
                `SELECT COUNT(*) FROM ${this.tableName}
                ${filterKeys.length > 0 ? `WHERE ${whereClause}` : ''}`,
                Object.values(query)
            )
        ])

        const totalDocs  = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalDocs / limit)

        return {
            docs:       dataResult.rows,
            totalDocs,
            totalPages,
            page,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        }
    }

    async findByID(id) {
        const result = await this.pool.query(
            `SELECT * FROM ${this.tableName} WHERE id = $1`,
            [id]
        )
        return result.rows[0] ?? null
    }

    async create(data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: ($1, $2, $3, ...)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const columns      = keys.join(', ')

        const result = await this.pool.query(
            `INSERT INTO ${this.tableName} (${columns})
             VALUES (${placeholders})
             RETURNING *`,
            values
        )
        return result.rows[0]
    }

    async update(id, data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: title = $1, price = $2, ...
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')

        const result = await this.pool.query(
            `UPDATE ${this.tableName}
             SET ${setClause}
             WHERE id = $${keys.length + 1}
             RETURNING *`,
            [...values, id]
        )
        return result.rows[0] ?? null
    }

    async delete(id) {
        const result = await this.pool.query(
            `DELETE FROM ${this.tableName}
             WHERE id = $1
             RETURNING *`,
            [id]
        )
        return result.rows[0] ?? null
    }
}

module.exports = PostgresRepository