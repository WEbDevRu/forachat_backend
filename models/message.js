const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    creator: mongoose.Schema.Types.ObjectId,
    creatorName: String,
    creatorColor: String,
    chat: mongoose.Schema.Types.ObjectId,
    type: String,
    text: String,
    date: Date
})

module.exports = mongoose.model('Message', messageSchema)