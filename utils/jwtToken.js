const jwt = require("jsonwebtoken")
const sendToken = (user, statusCode, res) => {
    console.log(user)
    const id = user._id;

    console.log(id);
    const token = jwt.sign({id}, process.env.JWT_SECREAT_KEY)

    const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    })
}

module.exports = sendToken;