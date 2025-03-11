const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    currLocation: {
        type: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        default: {}
    }
});

module.exports = mongoose.model('User', userSchema);
