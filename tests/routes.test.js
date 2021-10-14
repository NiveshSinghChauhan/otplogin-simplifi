const app = require('../app');
const client = require('../db');
const mongoose = require('mongoose');
const request = require("supertest");
const userModel = require("../models/user");
const otpModel = require("../models/otp");
const dayjs = require("dayjs");

const mockUser = require("../mock/data/user");
const mockOTP = require("../mock/data/otp");

jest.mock('@sendgrid/mail')


jest.setTimeout(6000)

describe('Routes', () => {

    beforeAll(async function () {
        await client();
        await userModel.create(mockUser);
    })

    afterAll(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });


    describe('/otp ', function () {

        test('post body validation', async function () {
            const response = await request(app).post('/otp').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('code', 'VALD_FAIL');
        });


        test('invalid user', async function () {
            const response = await request(app).post('/otp').send({
                phone_number: '1234098234'
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('code', 'INVLD_USR');
        });

        test('success', async function () {
            const response = await request(app).post('/otp').send({
                phone_number: mockUser.phone_number
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('otp_token');
        });

        test('otp requested before 5mins', async function () {
            const response = await request(app).post('/otp').send({
                phone_number: mockUser.phone_number
            });

            expect(response.status).toBe(406);
            expect(response.body).toHaveProperty('code', 'OTP_ALRDY_SENT');
            return;
        });
    })


    describe('/login', function () {

        test('post body validation', async function () {
            const response = await request(app).post('/login').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('code', 'VALD_FAIL');
        });


        test('with invalid user', async function () {

            await otpModel.deleteMany({});
            await otpModel.create(mockOTP.data);


            const response = await request(app).post('/login').send({
                phone_number: '1234098234',
                otp_token: mockOTP.data._id,
                otp: mockOTP.otp
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('code', 'INVLD_USR');
            return;
        });


        test('with wrong otp', async function () {
            const response = await request(app).post('/login').send({
                phone_number: mockUser.phone_number,
                otp_token: mockOTP.data._id,
                otp: '0000'
            });

            expect(response.status === 400 || response.status === 401).toBeTruthy();
            expect(response.body).toHaveProperty('code', "INVLD_OTP");
            // expect(/Invalid OTP, [0-5]{1} attempts left/.test(response.body)).toBeTruthy();

            return;
        });


        test('after 5 attempts', async function () {
            await otpModel.updateOne({ _id: mockOTP.data._id }, { $set: { attempts: 1 } }).exec();

            const response = await request(app).post('/login').send({
                phone_number: mockUser.phone_number,
                otp_token: mockOTP.data._id,
                otp: '0000'
            });

            expect(response.status === 401).toBeTruthy();
            expect(response.body).toHaveProperty('code', "INVLD_OTP");
            expect(response.body).toHaveProperty('message', "Invalid OTP, Your account is blocked for 1 hr.");

            // await otpModel.updateOne({ _id: mockOTP.data._id }, { $set: { attempts: 0 } }).exec();
        });


        test('with blocked user', async function () {
            await userModel.updateOne({ _id: mockUser._id }, {
                $set: { blocked_until: dayjs().add(5, 'minute').toDate() }
            });

            const response = await request(app).post('/login').send({
                phone_number: mockUser.phone_number,
                otp_token: mockOTP.data._id,
                otp: mockOTP.otp
            });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('code', "USR_BLCKD");

            await userModel.updateOne({ _id: mockUser._id }, {
                $set: { blocked_until: dayjs().subtract(1, 'minute').toDate() }
            });
        });

        test('success', async function () {
            await otpModel.create(mockOTP.data);

            const response = await request(app).post('/login').send({
                phone_number: mockUser.phone_number,
                otp_token: mockOTP.data._id,
                otp: mockOTP.otp
            });

            expect(response.status).toBe(202);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token === 'string').toBeTruthy();
            return;
        });
    })


})