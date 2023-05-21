const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
    },
    pfp: {
        type: String,
        required: true,
    },
    id_token: {
        type: String,
    },
    access_token: {
        type: String,
    },
    refresh_token: {
        type: String,
    },
    date: {
        type: Date,
        default: new Date,
    },
})

const Users = mongoose.model('Users', userSchema);

module.exports = Users