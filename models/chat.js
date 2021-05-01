const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    creator: mongoose.Schema.Types.ObjectId,
    name: String,
    members: Array,
    totalMembers: Number,
    creationDate:  Date
})

module.exports = mongoose.model('Chat', chatSchema)