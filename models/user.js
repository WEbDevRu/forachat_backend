const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    chats: Array,
    avatarColor: String,
    token: String ,
    regDate: Date
})

module.exports = mongoose.model('ChatUser', userSchema)