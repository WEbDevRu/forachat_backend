const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{
        type: String,
        required: true,
    },
    currentChat:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token: {
        type:String,
        required: true,
    },
    regDate: {
        type: Date
    }
})

module.exports = mongoose.model('ChatUser', userSchema)