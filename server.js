const app = require("./app");
const connectToDatabase = require("./db/Database");


//handling  uncaught Exception

process.on("uncaughtException", (err) => {
    console.log(`Error:${err.message}`);
    console.log(`shutting down the server for handling uncaught exception`)
})



// connect db

connectToDatabase();


//create server
const server = app.listen(process.env.PORT, () => {
    console.log(`server is running on http://localhost:${process.env.PORT} `)
})





// unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`shutting down the server for unhandle promise rejection`);

    server.close(() => {
        process.exit(1);
    });
});