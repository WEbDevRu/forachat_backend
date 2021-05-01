const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name:{
        type: String,
        required: true,
    },
    members:{
        type: Array,
        required: true
    },
    totalMembers:{
        type: Number,
        required: true
    },
    Messages:{
        type: Object
    }
})

module.exports = mongoose.model('ChatUser', userSchema)