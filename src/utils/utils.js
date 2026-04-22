const bcrypt = require('bcrypt')
const { Faker, es } = require('@faker-js/faker')

/** 
 * Hashea una contraseña utilizando bcrypt.
*@param {string} password - La contraseña que se desea hashear.
*@returns {string} - La contraseña hasheada utilizando bcrypt.
*/
const createHash = (password) => {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
   
}

/**
 * Compara una contraseña sin hashear con una contraseña hasheada utilizando bcrypt.
 * @param {string} passwordDB - La contraseña hasheada almacenada en la base de datos.
 * @param {string} passwordToValidate - La contraseña sin hashear que se desea validar.
 * @returns {boolean} - Devuelve true si las contraseñas coinciden, de lo contrario, devuelve false.
 */
const isValidPassword = (passwordDB ,passwordToValidate) =>{
    return bcrypt.compareSync(passwordToValidate, passwordDB);
}

//Generación de Mock
const generateProducts = (nroUser)=>{
    const faker = new Faker({ locale: [es] });
    let users = []
    try {
        for(let i=0; i < nroUser ; i++){
            const newProduct = {
                    _id: faker.database.mongodbObjectId(),
                    title: faker.commerce.product(),
                    description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi laoreet, ligula ac porttitor tempus, dolor enim dictum eros, cursus mollis lorem libero ut massa. Aenean ut dui tellus. Cras eleifend nibh id est consectetur aliquet. Duis sagittis erat nunc, mattis consectetur dui fringilla maximus.",
                    price: faker.commerce.price({ min: 1000, max: 20000}),
                    thumbnail: "Sin Imagen",
                    code: faker.string.uuid(),
                    stock: faker.number.int(300),
                    status: true,
                    category:faker.helpers.arrayElement(["Tecnología", "Ropa", "Bazar","Accesorios","Calzado"])
            }
            users.push(newProduct)
        }
    } catch (error) {
        console.log(error)
        return false
    }
    return users
}


module.exports= {
    createHash,
    isValidPassword,
    generateProducts,
}