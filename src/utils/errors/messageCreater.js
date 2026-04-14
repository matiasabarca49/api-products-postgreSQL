const generateUserErrorInfo = (user) => {
    // return msg custom
    console.log("Entro al generador de mensajes de usuario")
    return `Faltan una o más propiedades o fueron enviadas incompletas o no son válidas.
    Lista de propiedades requeridas:
        * fist_name: type String, recibido: ${user.name}
        * fist_name: type String, recibido: ${user.lastName}
        * email: type String, recibido: ${user.email}
        * age: type Number, recibido: ${user.email}
        * password: type String, recibido: ***************
`;
};
const generateProductErrorInfo = (product) => {
    // return msg custom
    return `Faltan una o más propiedades, fueron enviadas incompletas o no son válidas.
    Lista de propiedades requeridas:
        * title: type String, recibido: ${product.title}
        * description: type String, recibido: ${product.description}
        * price: type Number, recibido: ${product.price}
        * thumbnail: type String, recibido: ${product.thumbnail}
        * code: type String, recibido: ${product.code}
        * stock: type Number, recibido: ${product.stock}
        * category: type String, recibido: ${product.category}
        * owner: type String, recibido: ${product.owner}
`;
};



module.exports = {
    generateUserErrorInfo,
    generateProductErrorInfo,
}
