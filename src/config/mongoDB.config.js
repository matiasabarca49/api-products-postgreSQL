const mongoose = require('mongoose')

class MongoManager{
    constructor(url){
        this.url = url
    }
        
    connect(){
        return mongoose.connect(this.url)
            .then( connect => {
                const port = process.env.PORT || 8080
                console.log("✅ [OK] Conexión a la DB: ÉXITO");
                console.log(`✅ [OK] Server running on port ${port}`)
                console.log("==========================================");
                console.log("🟢 [STATUS] Servidor Backend ECOMMERCE UP");
                console.log("==========================================");
            })
            .catch( error => {
                console.log("🔴 [Error] Conexión a la DB: FALLÓ");
                console.log("==========================================");
                console.log("🔴  [STATUS] Servidor Backend ECOMMERCE DOWN");
                console.log("==========================================");
                console.log(error)
                process.exit()
            })
    }
}


module.exports = MongoManager