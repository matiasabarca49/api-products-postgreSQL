require('../../src/config/config.js')
const mongoose = require('mongoose')
const chai = require('chai')
const CartManager = require('../../src/dao/mongo/cart.mongo.js')
const MongoManager = require('../../src/dao/mongo/db.js')
const mongoManager = new MongoManager(`mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}
@cluster-mongo-coder-tes.qh8sdrt.mongodb.net/ecommerce`)
mongoManager.connect()

const expect = chai.expect

describe("Test de Carts",function(){
    //Para conciderar el tiempo en el que se accede a la DB en la nube
    this.timeout(15000)
    before(async function(){
        this.cartManager = new CartManager()
        this.idCart = ""
        /* const cartFound = await this.cartManagers.getCart())
        if(productFound){
            await this.productsManagers.delProduct(productFound._id, {rol: "Admin"})
        }  */
    })
    after(function(){
        mongoose.connection.close()
    })

    //Test 01
    it("Agregar un Carrito a la DB", async function(){
        //Given
        const newCart = {
            dateCart: "15/05/2023",
            products: [
                {
                    product: "647a41415445bee85430fe65",
                    quantity: 2
                },
                {
                    product: "647a5091cab54389b15d4b9b",
                    quantity: 5
                }
            ]
        }
        //Then
        const result = await this.cartManager.postCart(newCart)
        if(result){
            this.idCart= result._id
        }
        //Assert
        expect(result).is.ok
        expect(result).is.ok.and.to.have.property("_id")
        
    })
    //Test 02
    it('Obtener el carrito creado desde la DB',async function(){
        //Given
        const ID = this.idCart.toString()
        //Then
        const result = await this.cartManager.getCart(ID)
        //Assert
        expect(result).is.ok
        expect(result).is.ok.and.to.have.property("_id")

    })
    //Test 03
    it("Borrar todos los productos de un Cart de la DB", async function(){
        //Given
        const ID = this.idCart.toString()
        //Then
        const result = await this.cartManager.delFullCart(ID)

        //Assert
        expect(result.products.length).is.to.equal(0)
    })
    //Test 04
    it("Borrar Cart de la DB", async function(){
        //Given
        const ID = this.idCart.toString()
        //Then
        const result = await this.cartManager.delCart(ID)
        const check = await this.cartManager.getCart(ID)

        //Assert
        expect(check).is.to.equal(null)
    })

})

