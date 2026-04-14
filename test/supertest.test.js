require('../src/config/config')
const mongoose = require('mongoose')
const chai = require('chai')
const supertest = require('supertest')
const expect = chai.expect
const requester = supertest('http://localhost:8080')
//Administracion DB
mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}
@cluster-mongo-coder-tes.qh8sdrt.mongodb.net/ecommerce`)
const UsersManager = require('../src/dao/mongo/users.mongo')
const ProductsManagers = require('../src/dao/mongo/products.mongo')
const CartManager = require('../src/dao/mongo/cart.mongo')


describe('Test de API', function(){
    before(async function(){
        this.usersManager = new UsersManager()
    })
    after(async function(){
        const userFound = await this.usersManager.getUser({email: "TestUser@correo.com" })
        if(userFound){
           const result = await this.usersManager.delUser(userFound._id.toString())
        }
        mongoose.connection.close() 
    })
    describe('Test de Sessions', async function(){
        this.timeout(15000)
        //Test 01
        it("Registrando Usuario", async function(){
            this.timeout(15000)
        //Given
        const registerUser={
            name:"Test",
            lastName:"User",
            age:24,
            email:"TestUser@correo.com",
            password:"1234"
        }
        //Then
        const result = await requester.post("/api/sessions/register").send(registerUser)
        const urlRedirected = result.text.split(" ")[3]
        //Assert
        expect(result.statusCode).is.ok.and.equal(302)
        expect(result.redirect).is.ok.and.equal(true)
        expect(urlRedirected).is.ok.and.to.equal("/api/sessions/login")
        })
        //Test 02
        it("Loguear usuario", async function(){
            //Given
            const LoginUser={
                email:"TestUser@correo.com",
                password:"1234"
            }
            //Then
            const result = await requester.post("/api/sessions/login").send(LoginUser)
            const urlRedirected = result.text.split(" ")[3]
            //Assert
            expect(result.statusCode).is.ok.and.equal(302)
            expect(result.redirect).is.ok.and.equal(true)
            expect(urlRedirected).is.ok.and.to.equal("/products")

        })
        //Test 03
        it('Desloguear usuario con éxito', async function(){
            //Given
            //Then
            const result = await requester.get("/api/sessions/logout")
            const urlRedirected = result.text.split(" ")[3]
            //Assert
            expect(result.statusCode).is.ok.and.equal(302)
            expect(result.redirect).is.ok.and.equal(true)
            expect(urlRedirected).is.ok.and.to.equal("/api/sessions/login")
        })
        //Test 04
        it("Evitar registrar usuario con email que ya se encuentra en DB", async function(){
        //Given
        const registerRepeatedUser={
            name:"Test 02",
            lastName:"User02",
            age:21,
            email:"TestUser@correo.com",
            password:"12345"
        }
        //Then
        const result = await requester.post("/api/sessions/register").send(registerRepeatedUser)
        const urlRedirected = result.text.split(" ")[3]
        //Assert
        expect(result.statusCode).is.ok.and.equal(302)
        expect(result.redirect).is.ok.and.equal(true)
        expect(urlRedirected).is.ok.and.to.equal("/api/sessions/fail?error=register")
        })
        
    })
    describe("Test de Carts",async function(){
        this.timeout(15000)
        before(function(){
            this.productsManagers = new ProductsManagers()
            this.cartManager = new CartManager()
            this.Cookie
            this.cartID
            this.ticketCode
        })
        //Test 01
        it("Loguear usuario", async function(){
            //Given
            const LoginUser={
                email:"TestUser@correo.com",
                password:"1234"
            }
            //Then
            const result = await requester.post("/api/sessions/login").send(LoginUser)
            const urlRedirected = result.text.split(" ")[3]
            //Nos permite mantener la sesion del usuario para agegar producto y generar compra
            this.Cookie = result.header['set-cookie']
            //Assert
            expect(result.statusCode).is.ok.and.equal(302)
            expect(result.redirect).is.ok.and.equal(true)
            expect(urlRedirected).is.ok.and.to.equal("/products")
        })
        //Test 02
        it("Agregar producto a Cart", async function(){
            //Given
            const LoginUser={
                email:"TestUser@correo.com",
                password:"1234"
            }
            const productToAdded = await this.productsManagers.getProductsByID('6514684ef99aab31f7ccd617')
            //Then
            const result = await requester.post("/api/users/addcart").set('Cookie', this.Cookie ).send(productToAdded)
            //Assert
            expect(result.statusCode).is.ok.and.equal(201)
            expect(result._body.status).is.ok.and.equal(' Succesfull ')
        })
        //Test 03
        it("Agregar Cart al Usuario y generar compra", async function(){
            //Given
            const {_body} = await requester.get("/api/sessions/current").set('Cookie', this.Cookie )
            const dateAtMomentPurchase = new Date()
            const finalCart = {
                dateCart: `${dateAtMomentPurchase.getDate()}/${dateAtMomentPurchase.getMonth()+1}/${dateAtMomentPurchase.getFullYear()}`,
                products: _body.currentUser.cart
            }
            //Then
            const resultAddCart = await requester.post("/api/carts/").set('Cookie', this.Cookie ).send(finalCart)
            const resultPurchase = await requester.get(`/api/carts/${resultAddCart._body.cart._id}/purchase`).set('Cookie', this.Cookie )
            this.cartID = resultAddCart._body.cart._id
            this.ticketCode = resultPurchase._body.ticket.code
            //Assert
            expect(resultAddCart.statusCode).is.ok.and.equal(201)
            expect(resultAddCart._body.status).is.ok.and.equal('Success')
            expect(resultPurchase.statusCode).is.ok.and.equal(201)
            expect(resultPurchase._body.status).is.ok.and.equal('Success')
            expect(resultPurchase._body).is.ok.and.have.property('ticket')
            //Borrando Cart y Ticket de la DB
            this.cartManager.delCart(this.cartID)
            await this.cartManager.delTicket(this.ticketCode)
        })
    })
})
