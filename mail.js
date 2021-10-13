const sendgrid = require('@sendgrid/mail')

sendgrid.setApiKey(process.env.SENDGRID_KEY);


function sendEmail(toEmail, { subject, message }) {
    return sendgrid.send({
        to: toEmail,
        from: 'niveshtempacc@gmail.com',
        subject: subject,
        text: message,
        html: message,
    })
}


module.exports = {
    sendEmail
}
