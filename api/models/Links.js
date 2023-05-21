const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    shortid: {
        type: String,
        required: true,
    },
    data: {
        type: Object,
    },
    userEmail: {
        type: String,
    },
    date: {
        type: String,
    },
})

const Links = mongoose.model('Links', linkSchema);

module.exports = Links