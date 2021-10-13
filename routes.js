const { sendEmail } = require('./mail');
const userModel = require('./models/user');
const { generateOTP, verifyOTP, generateToken } = require('./utils');
const { log } = require('./logger');
const otpModel = require('./models/otp');
const dayjs = require('dayjs');
const { addUserToBlockedQueue } = require('./queue/block-user');
const { object, string } = require('yup')

const router = require('express').Router();

router.post('/otp', async (req, res) => {
    try {

        try {
            await object({ phone_number: string().trim().length(10).required('Phone number is required') })
                .validate(req.body, { abortEarly: false })
        } catch (error) {
            res.status(400).json({ code: 'VALD_FAIL', message: error.errors.join(', ') });
            return;
        }

        const { phone_number } = req.body;

        const user = await userModel.findOne({ phone_number }).exec();

        if (!user) {
            res.status(400).json({ code: 'INVLD_USR', message: 'Invalid User, User doesn\'t exist' });
            return;
        }
        const otpTrack = await otpModel.findOne({ user_id: user.id }).sort({ timestamp: 'desc' }).exec();

        // checking otp validity
        if (otpTrack && dayjs().isBefore(dayjs(otpTrack._doc.timestamp).add(5, 'minute'))) {
            res.status(406).send({ code: 'OTP_ALRDY_SENT', message: 'Otp Already Sent! Wait for 5 mins to resend.' })
            return;
        } else {
            const { otp, hash } = generateOTP(phone_number);
            const timestamp = Date.now();

            const otpTrack = await (new otpModel({
                user_id: user._id,
                hash,
                attempts: 5,
                timestamp
            })).save()

            await sendEmail(user._doc.email, {
                subject: 'OTP for Login',
                message: `Your login otp is <b>${otp}</b>`
            })

            res.status(200).send({ otp_token: otpTrack._id })
        }

    } catch (error) {
        log.error(error);
        res.status(500).send({ error: 'INTRNL_SERVER_ERR', message: 'Internal server error' })
    }
});


router.post('/login', async (req, res) => {
    try {

        try {
            await object({
                phone_number: string().trim().length(10).required('Phone number is required'),
                otp_token: string().trim().required('OTP Token is required'),
                otp: string().length(4).trim().required('OTP is required'),
            }).validate(req.body, { abortEarly: false });
        } catch (error) {
            res.status(400).json({ code: 'VALD_FAIL', message: error.errors.join(', ') });
            return;
        }

        const { otp_token, otp, phone_number } = req.body;

        const user = await userModel.findOne({ phone_number }).exec();

        // checking if user exist or blocked
        if (!user) {
            res.status(400).json({ code: 'INVLD_USR', message: 'Invalid User, User doesn\'t exist' });
            return;
        } else if (user._doc.blocked) {
            res.status(403).json({ code: 'USR_BLCKD', message: 'Account is blocked! Not allowed to login.' });
            return;
        }

        const otpTrack = await otpModel.findOne({ _id: otp_token }).exec();

        if (otpTrack) {
            if (verifyOTP(otp, phone_number, otpTrack._doc.hash)) {
                const token = generateToken(phone_number, user.id);
                await otpModel.deleteMany({ user_id: otpTrack.user_id }).exec();

                res.status(202).json({ token });
                return;
            } else {
                const updatedOtpTrack = await otpModel.findOneAndUpdate({ _id: otpTrack.id }, { $inc: { attempts: -1 } }, { new: true }).exec();
                let errorMsg = 'Invalid OTP, ';

                if (updatedOtpTrack._doc.attempts === 0) {
                    const blockedAt = Date.now();

                    await Promise.all([
                        user.updateOne({ $set: { blocked: true, blocked_at: blockedAt } }).exec(),
                        otpTrack.remove()
                    ]);

                    addUserToBlockedQueue(user.id, blockedAt);

                    errorMsg += 'Your account is blocked for 1 hr.'
                } else {
                    errorMsg += `${updatedOtpTrack._doc.attempts} attempts left`;
                }

                res.status(401).json({ code: 'INVLD_OTP', message: errorMsg });
                return;
            }
        }

        res.status(400).json({ code: 'INVLD_OTP', message: `Invalid OTP` });
        return;
    } catch (error) {
        log.error(error);
        res.status(500).send({ error: 'INTRNL_SERVER_ERR', message: 'Internal server error' })
    }
});



module.exports = router;