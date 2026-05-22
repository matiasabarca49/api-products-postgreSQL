function getGithubCallback(req, res) {
    const userFound = req.user
    req.session.idUser = userFound.id
    req.session.user = userFound.name || " "
    req.session.last_name = userFound.lastName || " "
    req.session.email = userFound.email
    req.session.age = userFound.age || " "
    req.session.rol = userFound.rol
    req.session.carts = userFound.carts
    res.redirect("/")
  }

module.exports = {
    getGithubCallback
}