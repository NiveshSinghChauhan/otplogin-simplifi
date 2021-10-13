const { customAlphabet } = require('nanoid')
const { hashSync, compareSync } = require('bcrypt')
const { sign } = require('jsonwebtoken')


function generateOTP(phoneNumber, optLength = 4) {
    const otp = customAlphabet('1234567890', optLength)();
    const hash = hashSync(`${phoneNumber}-${otp}`, 10);

    return { otp, hash }
}

function verifyOTP(otp, phoneNumber, hash) {
    return compareSync(`${phoneNumber}-${otp}`, hash)
}



function generateToken(phone_number, userId) {
    return sign(
        { id: userId, phone_number },
        process.env.SECRET,
        { algorithm: 'HS512', issuer: 'My API', expiresIn: '7d' }
    );
}

module.exports = {
    generateOTP,
    verifyOTP,
    generateToken
}