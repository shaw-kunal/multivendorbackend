const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res) => {
    const id = user._id;

    console.log(id);
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY);
    console.log("token", token);
    
    const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        sameSite: "none",
        secure: true // Add this line
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
};

module.exports = sendToken;
