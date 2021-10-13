const user = require("../mock/data/user");
const { generateOTP, verifyOTP, generateToken } = require("../utils")

describe('utils', () => {

    let otp, hash, phoneNumber = user.phone_number;

    test('generate otp and hash', () => {
        const otpHash = generateOTP(phoneNumber);

        expect(otpHash).toHaveProperty('hash')
        expect(otpHash).toHaveProperty('otp')

        expect(typeof otpHash.hash === 'string').toBeTruthy();
        expect(typeof otpHash.otp === 'string').toBeTruthy();

        hash = otpHash.hash;
        otp = otpHash.otp
    })

    test('verify otp', () => {
        const isVerified = verifyOTP(otp, phoneNumber, hash);

        expect(typeof isVerified === 'boolean').toBeTruthy()
    })

    test('generate otp and hash', () => {
        const token = generateToken(phoneNumber, user._id);

        expect(typeof token === 'string').toBeTruthy();
    })

})