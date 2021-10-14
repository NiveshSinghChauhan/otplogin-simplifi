const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    // blocked: {
    //     type: Boolean,
    // },
    blocked_until: {
        type: Date,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const userModel = model('user', userSchema, 'users');

module.exports = userModel;