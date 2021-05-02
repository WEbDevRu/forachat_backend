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
                let onlineUsers = docs.map(item=> ({userId: item.userId, name: item.name, avatarColor: item.avatarColor}))
                io.sockets.to(data.chatId).emit('chat/ONLINE_USERS', {list: onlineUsers})
            })
    })


    socket.on('chat/JOIN', async (data)=>{
        let userId = jwt.verify(data.token, 'jerjg').userId
        let chatId = data.chatId

        let  checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")


        if(!checkForHexRegExp.test(chatId)){
            return  socket.emit('chat/JOIN_ERROR', {error: "Wrong chatId"})
        }
        let chat = await Chat
            .findOne({_id: chatId})
            .then(doc=> (doc)).catch(error=>{
                console.log(error)
            })

        if(chat === null){
            socket.emit('chat/JOIN_ERROR', {error: "Wrong chatId"})
            console.log("Wrong chatId")
        }
        else if(chat.members.includes(userId)){
            socket.emit('chat/JOIN_ERROR', {error: "You already in this chat"})
            console.log("You already in this chat")
        }
        else{

            Chat.findOneAndUpdate({_id: chatId}, {$push: {members: userId},  $inc:{totalMembers: 1}}).then((doc)=>{
                ChatUser.findOneAndUpdate({_id: userId}, {$push: {chats: chatId}}).then((doc)=>{
                    socket.emit('chat/JOIN_SUCCESS', {message: "You join the chat"})
                    console.log('joined')
                })
            })


        }



    })




}