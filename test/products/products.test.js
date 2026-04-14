const config = require('../../src/config/config.js')
const mongoose = require('mongoose')
const chai = require('chai')
const ProductsManagers = require('../../src/dao/mongo/products.mongo.js')
const MongoManager = require('../../src/dao/mongo/db.js')
const mongoManager = new MongoManager(`mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}
@cluster-mongo-coder-tes.qh8sdrt.mongodb.net/ecommerce`)
mongoManager.connect()

const expect = chai.expect

describe("Test de Productos",function(){
    //Para conciderar el tiempo en el que se accede a la DB en la nube
    this.timeout(15000)
    before(async function(){
        this.productsManagers = new ProductsManagers()
        this.idProduct = " "
        const productFound = await this.productsManagers.getProductsByFilter({code: "a1x7j3"})
        if(productFound){
            await this.productsManagers.delProduct(productFound._id, {rol: "Admin"})
        } 
    })
    after(function(){
        mongoose.connection.close()
    })

    //Test 01
    it("Obtener productos en formato arreglo", async function(){
        //Given
        //Then
        const result = await this.productsManagers.getProducts()
        //Assert
        expect(result).to.be.a('Array')
        if(result.length !== 0){
            expect(result[0]).is.ok.and.to.have.property("_id")
        }
    })
    //Test 02
    it("Crear un producto en la DB", async function(){
        //Given
        const newProduct = {
            title: "Producto Test Mocha",
            description: "Este es un producto prueba para el test con Mocha",
            price: 4570,
            thumbnail: "Sin imagen",
            code: "a1x7j3",
            stock: 25,
            status: true,
            category: "Ropa",
            owner: "Admin"
          }
        //Then
        const result = await this.productsManagers.postProduct(newProduct)
        if (result){
            this.idProduct = result._id
        }
        //Assert
        expect(result).is.ok
        expect(result).is.ok.and.to.have.property("_id")
        
    })
    //Test 03
    it('Obtener el Producto creado por su ID',async function(){
        //Given
        const ID = this.idProduct.toString()
        //Then
        const result = await this.productsManagers.getProductsByID(ID)
        //Assert
        expect(result).is.ok
        expect(result).is.ok.and.to.have.property("_id")

    })

})


