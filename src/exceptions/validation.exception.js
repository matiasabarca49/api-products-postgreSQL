const AppError = require("../utils/errors/AppError.js");

class NotFoundException extends AppError{
    constructor(message){
        super(404, message);
    }
}

class DuplicateException extends AppError{
     constructor(message){
        super(409, message);
    }
}

class ForbiddenException extends AppError{
    constructor(message){
        super(403, message);
    }
}

class BadRequestException extends AppError{
    constructor(message){
        super(400, message);
    }
}

class ForeignKeyConstraintException extends AppError{
    constructor(message){
        super(409, message);
    }
}

module.exports = {
    NotFoundException,
    DuplicateException,
    ForbiddenException,
    BadRequestException,
    ForeignKeyConstraintException
}