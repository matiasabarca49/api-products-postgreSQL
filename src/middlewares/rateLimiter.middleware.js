const {rateLimit} = require('express-rate-limit')

const rateLimitHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 100,
    message:{success: false, error: "Demaciadas peticiones, intente más tarde", statusCode: 429},
    legacyHeaders: false,
    standardHeaders: "draft-8"
})

module.exports = {rateLimitHandler}