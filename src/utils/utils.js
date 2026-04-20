const bcrypt = require('bcrypt')
const { Faker, es } = require('@faker-js/faker')


let secretSaved = []

//Encriptación
const createHash = (password) => {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
   
}

const isValidPassword = (passwordDB ,passwordToValidate) =>{
    return bcrypt.compareSync(passwordToValidate, passwordDB)
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

const saveSecret = (secretCreated)=>{
    secretSaved.push(secretCreated)
    //Borrar clave guardada para deshabilitar link
    setTimeout( ()=>{
       secretSaved = secretSaved.filter( secret => secret != secretCreated)
    },3600000)
}

const searchSecret = (secretToSearch, userMail)=>{
    const isValid = isValidPassword( {password: secretToSearch}, `Cod!34fdsert${userMail}`)
    if (isValid){
        const secretFound = secretSaved.find( secret => secret === `${secretToSearch}&qui=45604545rgfdt355iuiljhgfds/&>S43&filter=user&type=change&user=notFound`)
        if (secretFound){
            return true
        }
        else{
            return false
        }    
    }else{
        return false
    }
}



module.exports= {
    createHash,
    isValidPassword,
    generateProducts,
    saveSecret,
    searchSecret
}