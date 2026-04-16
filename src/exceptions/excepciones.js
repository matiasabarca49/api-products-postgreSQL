//AppError
const AppError = require('../utils/errors/AppError.js')
//validation
const {NotFoundException, DuplicateException, ForbiddenException} = require('./validation.exception.js')



module.exports = {
    NotFoundException,
    DuplicateException,
    ForbiddenException
}