const multer = require('multer')
// Configuraciones de Multer
// Configuracion de destino
// Asignamcion de nombre del archivo
const storage = multer.diskStorage({
    // destino
    destination: function (req, file, cb) {
        if(req.body.type === "product"){
            cb(null, `${process.cwd()}/src/public/files/products`)
        }
        else if(req.body.type === "profile"){
            cb(null, `${process.cwd()}/src/public/files/profiles`)
        }else{
            cb(null, `${process.cwd()}/src/public/files/documents`)
        }
    },
    // name - fileName
    // el nombre que quiero que tengan los archivos que voy a subir
    filename: function (req, file, cb) {
        const date = new Date().toString()
        cb(null, `${req.params.uid}-${req.body.type}-${file.originalname}-${date.split(" ").slice(0,5)}`)
    }
})


const uploader = multer({
    storage,
    fileFilter: function (req, file, cb){
        const isValid = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"].includes(file.originalname.split(".")[0])
        if (isValid) {
            cb(null, true)
        }else {
            cb(new Error("Solo puede subir Archivos llamados: Identificacion - Comprobante de domicilio- Comprobante de estado de cuenta"), false)
        }    
    },
    // si se genera algun error, lo capturamos
    onError: function (err, next) {
        console.log(err);
        next();
    }
})

module.exports = uploader