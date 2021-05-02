const mongoose = require("mongoose");
const ChatUser = require('../models/user')
const Chat = require('../models/chat')
const jwt = require("jsonwebtoken");


module.exports = (socket, io) => {

    // event calls when user enters the chat
    socket.on('chat/ENTER', async (data)=>{
        //give socket nickname with user token
        socket.name = data.token
        await socket.join(data.chatId)

        //list of sockets who were in the room right now
        let sockets = await io.in(data.chatId).fetchSockets()
        //get usersId from list of sockets who were in the room right now
        sockets = sockets.map(item=>  jwt.verify(item.name, 'jerjg').userId)
        //find information about this users in DB
        ChatUser
            .find({_id: sockets})
            .then(docs=>{
                let onlineUsers = docs.map(item=> ({userId: item.userId, name: item.name, avatarColor: item.avatarColor}))
                //send event to all users in chat with new users list
                io.sockets.to(data.chatId).emit('chat/ONLINE_USERS', {list: onlineUsers})

        })

    })

    // event calls when user enters the chat
    socket.on('chat/LEAVE',  async (data)=>{
        socket.name = data.token
        //delete user from chat
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


    //event calls when client on invite link url
    socket.on('chat/JOIN', async (data)=>{
        let userId = jwt.verify(data.token, 'jerjg').userId
        let chatId = data.chatId

        let  checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")

        //check if URL param is MongoDb ObjectId
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
            //update chat document, add new member and increment members count
            Chat.findOneAndUpdate({_id: chatId}, {$push: {members: userId},  $inc:{totalMembers: 1}}).then((doc)=>{
                ChatUser.findOneAndUpdate({_id: userId}, {$push: {chats: chatId}}).then((doc)=>{
                    socket.emit('chat/JOIN_SUCCESS', {message: "You join the chat"})
                    console.log('joined')
                })
            })
        }
    })

    //event calls when client send new message
    socket.on('chat/NEW_MESSAGE', async (data) =>{
        let userId = jwt.verify(data.token, 'jerjg').userId
        let chatId = data.chatId
        let message = data.text
        //get information about user, which sent message
        let user = await ChatUser
            .findOne({_id: userId})
            .then(doc => (doc))

        //form the object of new message
        message = { creator: userId,
                    creatorName: user.name,
                    creatorColor: user.avatarColor,
                    chat: chatId,
                    type: "normal",
                    text: message,
                    date: new Date()
        }

        //send message to all users in chat
        io.sockets.to(data.chatId).emit('chat/NEW_MESSAGE_POSTED', {message: message})
    })




}