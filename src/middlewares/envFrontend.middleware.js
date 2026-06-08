//Inyección de variables de entorno para el frontend
const envFrontHandler = (req, res, next) => {

   res.locals.runtimeConfig = {
      apiUrl: process.env.API_URL || 'http://localhost:8080',
      frontendUrl: process.env.URL_FRONTEND || 'http://localhost:8080'
   }

   next()
}

const confViews = (req, res, next) => {

   const user = req.user || null

   const isPanel = req.path.startsWith("/admin")
   const showCart = [
      "/",
      "/productview"
   ]

   res.locals.userLoged = user

   res.locals.permissions = {
      canBuy: user && user.rol !== "admin",
      canAdminSales: user?.rol !== "user",
      canAdminProducts: user?.rol !== "user",
      isAdmin: user?.rol === "admin",
      isPremium: user?.rol === "premium"
   }

   res.locals.navigation = {
      isPanel,
      sectionName: isPanel ? "Panel" : "Tienda",
      showCart: showCart.includes(req.path)
   }

   next()
}

module.exports = {
   envFrontHandler,
   confViews
}