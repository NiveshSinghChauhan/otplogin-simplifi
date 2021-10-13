const { Schema, model, SchemaTypes } = require('mongoose');


const otpSchema = new Schema({
    user_id: {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: 'user'
    },
    hash: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        required: true,
        default: 5,
        min: 0
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const otpModel = model('otp', otpSchema, 'otps');

module.exports = otpModel;