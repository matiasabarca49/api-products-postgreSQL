const errorHandler = (err, req, res, next) =>{

    //En caso de que no se cree con AppError
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    const level = statusCode >= 500 ? 'error' : 'warning';

    req.logger.log(level, '❌ ERROR CAPTURADO', {
        error: {
            message: err.message,
            name: err.name,
            stack: err.stack,
            isOperational
        },
        request: {
            method: req.method,
            path: req.path
        },
        statusCode
    });

    //Errores errores esperados (validaciones y negocio)
    //Este error llega al cliente
    if(isOperational){
        return res.status(statusCode).json({
            success: false,
            error: {
                statusCode: err.statusCode,
                message: err.message
            }
        })
    }

    //Errores inesperados o de sistema
    //El error se oculta al cliente
    return res.status(statusCode).json({
            success: false,
            error: {
                statusCode: statusCode,
                message: "Error en el Servidor. Intente más tarde"
            }
    })

}

module.exports = {
    errorHandler
}