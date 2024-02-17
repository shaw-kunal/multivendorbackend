const multer = require('multer')

//file upload
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/")
    },filename:(req,file,cb)=>{
        cb(null,req.body.name);
    }
})


exports.upload = multer({storage:storage})