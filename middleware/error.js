const ErrorHandler = require('../utils/ErrorHandler')


module.exports = (err, req, res, next) => {
    err.stausCode = err.stausCode || 500
    err.messgae = err.messgae || "Internal server error"

    // wrong mongodb id error
    if (err.name === "CastError") {
        const message = `Resource not found  with this id.. Invalid ${err.path}`
        err = new ErrorHandler(messagPe, 400)
    }

    // Duplicate key Error

    if (err.code === 11000) {
        const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    // wrng jwt error
    if (err.name === "JsonWebTokenError") {
        const message =`Your url is invalid please try again later`
        err = new ErrorHandler(message,400);
    }
    // jwt expired

    if(err.name === "TokenExpiredError"){
        const message = 'Your Url is expired please try again later!'
        err = new ErrorHandler(message,400)
    }


    res.status(err.stausCode).json({
        succes:false,
        message:err.message
    })
}
