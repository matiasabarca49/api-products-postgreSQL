const ProductsService = require('../../service/products.service.js')
const UsersService = require('../../service/users.service.js')

const usersService =  new UsersService()
const productsService = new ProductsService()

const getUsersPageController = async (req, res) =>{

    try{
        const products = await productsService.findManageableProducts(req.session);
        const users =  await usersService.findAll();
    
        return res.render('admin',{ products: products.payload, users: users.payload, userLoged: req.session })
        
    }catch(error){
        console.log(error);
        res.status(500).send({status: "ERROR", reason: error})
    }
} 

const getUpgradeUser = (req, res, next) =>{
    try{
        return res.render('upgradeUser');
    }catch(error){
      next(error)
    }
}

module.exports = { getUsersPageController, getUpgradeUser }