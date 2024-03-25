const nodemailer = require('nodemailer')


const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:"patelkarm3010@gmail.com",
            pass:"hqxx ogbs ujxm gauu"
        },
    })

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(mailOptions)


}


module.exports = sendMail;