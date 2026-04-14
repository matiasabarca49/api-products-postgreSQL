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

//Reescrituras de documentos DB
//Debido a un error o directiva de Handlebars los productos son reescritos para lograr que handlebars renderice
const reWriteDocsDB = async (documentFormat, documentsFromBase) =>{
    const documentsReWrited = []
    documentsFromBase.forEach( document => {
        let documentReWrited
        if(documentFormat === "products"){
            documentReWrited = {
                title: document.title || "Not Declared",
                description: document.description || "Not Declared",
                price: document.price || "Not Declared",
                code: document.code || "Not Declared",
                stock: document.stock || "Not Declared",
                status: document.status || "Not Declared",
                category: document.category || "Not Declared",
                owner: document.owner || "Not Declared",
                id: document.id 
            }
        }else{
            documentReWrited = {
                name: document.name || "Not Declared",
                lastName: document.lastName || "Not Declared",
                age: document.age || "Not Declared",
                email: document.email || "Not Declared",
                rol: document.rol || "Not Declared",
                id: document.id 
            }
        }
        documentsReWrited.push(documentReWrited)
    })  
    return documentsReWrited
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

//General Formato Email
generateFormatEmail = (email, payload) =>{
    const mailOptions = {
        from: `Tienda de Productos  <${process.env.GMAIL_CREDENTIAL_USER}>`,
        to: `${email}`,
        subject: `${payload.subject}`,
        html:`
            <div>  
                <h1> ${payload.head} </h1>
                <p> ${payload.body} </p>
            </div>
        `,
        attachments: []  
    }
    return mailOptions
}

const generateLink = (user) =>{
    const key = createHash(`Cod!34fdsert${ user.email }`)
    const secret = `${key}&qui=45604545rgfdt355iuiljhgfds/&>S43&filter=user&type=change&user=notFound` 
    saveSecret(secret)
    const mailOptionsChangePassword = {
        from: `Tienda de Productos  <${process.env.GMAIL_CREDENTIAL_USER}>`,
        to: `${user.email}`,
        subject: "Solicitud de cambio de contraseña",
        html:`
            <div>  
                <h1> Restauracion de contraseña </h1>
                <h4>Hola ${user.name}</h4>
                <p> Ingrese al siguiente link para cambiar la contraseña: </p>
                <a href="http://localhost:8080/users/generatepassword?secret=${secret}&email=${user.email}">Ir a cambiar constraseña</a>
                <p>El link para cambio de contraseña expirará en 1 hora. En ese caso deberá solicitar de nuevo</p>
                <p style="margin-top: 20px">En caso de no solicitar cambio de contraseña. Desestime este correo</p>
            </div>
        `,
        attachments: []  
    }

    return mailOptionsChangePassword
}

module.exports= {
    createHash,
    isValidPassword,
    reWriteDocsDB,
    generateProducts,
    saveSecret,
    searchSecret,
    generateFormatEmail,
    generateLink
}