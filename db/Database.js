const mongoose   = require('mongoose')

const connectToDatabase=()=>{

   mongoose.connect(process.env.DB_URL).then((data)=>{
    console.log(`mongodb connected with ${data.connection.host}`)
   }).catch((err)=> console.log(err))
}

module.exports = connectToDatabase