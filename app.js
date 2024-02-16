const express = require("express");
const ErrorHandler = require("./utils/ErrorHandler");
const app = express();
const dotenv = require("dotenv")






//config the .env file
dotenv.config({
    path: "config/.env"
})














// it's for error handlin
app.use(ErrorHandler)

module.exports = app

