const { generateProducts } = require('../utils/utils.js')

const getMockProducts = (req,res)=>{
    try{
        let productsMock = generateProducts(100)
        productsMock
            ?   res.status(200).send({status: "Succesfull",Products: productsMock})
            :   res.status(500).send({status: "ERROR", reason: "Falló el servidor"})
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/mockingproducts" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al generar productos mock. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

module.exports= {
    getMockProducts
}