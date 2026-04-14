class CustomError {
    constructor(){
        
    }
    createError({ name = "Error", cause, message, code = 1 }) {
        // Logica
        const error = new Error(message, { cause: new Error(cause) })
        error.name = name;
        error.code = code;
        throw error
    };
}

module.exports = CustomError