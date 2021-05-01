const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    creator: mongoose.Schema.Types.ObjectId,
    name: String,
    avatarColor: String,
    members: Array,
    totalMembers: Number,
    lastMessage: Object,
    creationDate:  Date
})

module.exports = mongoose.model('Chat', chatSchema)