const mongoose = require("mongoose");
const ChatUser = require('../models/user')
const Chat = require('../models/chat')
const Message = require('../models/message')
const jwt = require("jsonwebtoken");


module.exports = (socket, io) => {

    socket.on('chat/ENTER', async (data)=>{
        socket.name = data.token
        await socket.join(data.chatId)
        let sockets = await io.in(data.chatId).fetchSockets()
        sockets = sockets.map(item=>  jwt.verify(item.name, 'jerjg').userId)
        ChatUser
            .find({_id: sockets})
            .then(docs=>{
                console.log('user join')
                let onlineUsers = docs.map(item=> ({userId: item.userId, name: item.name, avatarColor: item.avatarColor}))
                io.sockets.to(data.chatId).emit('chat/ONLINE_USERS', {list: onlineUsers})

        })

    })

    socket.on('chat/LEAVE',  async (data)=>{
        socket.name = data.token
        await socket.leave(data.chatId)

        let sockets = await io.in(data.chatId).fetchSockets()
        sockets = sockets.map(item=>  jwt.verify(item.name, 'jerjg').userId)
        ChatUser
            .find({_id: sockets})
            .then(docs=>{
                console.log('user leave')
                let onlineUsers = docs.map(item=> ({userId: item.userId, name: item.name, avatarColor: item.avatarColor}))
                io.sockets.to(data.chatId).emit('chat/ONLINE_USERS', {list: onlineUsers})
            })
    })




}