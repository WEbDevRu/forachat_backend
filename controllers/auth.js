const mongoose = require("mongoose");
const ChatUser = require('../models/user')
const Chat = require('../models/chat')
const Message = require('../models/message')
const jwt = require("jsonwebtoken");


module.exports = (socket) => {

        socket.on('auth/REGISTRATION', (data)=>{
            if(data.name && data.name.length > 1){
                console.log('registration', data.name);
                let avatarColors = ["#5d4038", "#5c6bc0", "#ec417b", "#689f39", "#c2175b", "#018a7a", "#5c6bc0", "#0288d1", "#00579c", "#bf360c", "#7e57c2", "#00887a"]
                let getRandomInt = (max) => {
                    return Math.floor(Math.random() * max);
                }
                let getRandomColor = () =>{
                    return avatarColors[getRandomInt(avatarColors.length)]
                }

                let userId = mongoose.Types.ObjectId()
                let chatId = mongoose.Types.ObjectId()
                let currentDate = new Date()

                const token = jwt.sign(
                    {
                        userId: userId,
                        type: 'registration'
                    },
                    'jerjg',
                {}
                )

                const newChat = new Chat({
                    _id: chatId,
                    creator: userId,
                    name: data.name,
                    members: [userId],
                    totalMembers: 1,
                    creationDate: currentDate
                })

                const User = new ChatUser({
                    _id: userId,
                    name: data.name,
                    chats: [chatId],
                    token: token,
                    avatarColor: getRandomColor(),
                    regDate: currentDate
                })


                const newMessage = new Message({
                    _id: mongoose.Types.ObjectId(),
                    creator: userId,
                    creatorName: data.name,
                    creatorColor: 'none',
                    chat: chatId,
                    type: 'notification',
                    text: 'Chat created',
                    date: currentDate
                })



                Promise.all([newChat.save(), User.save(), newMessage.save()])
                    .then(response =>{
                        socket.emit('auth/REGISTRATION_SUCCESS', {token: response[1].token})
                        console.log(response)
                    })
                    .catch(error=>{
                        socket.emit('auth/REGISTRATION_SUCCESS', {token: response[1].token})
                    })
                socket.emit('auth/REGISTRATION_SUCCESS', {userData: data.name})
            }
            else{
                socket.emit('auth/REGISTRATION_ERROR', {error: "name is required"})
            }
        })



        socket.on('auth/AUTH', (data) =>{

            if(data.token){
                const decoded = jwt.verify(data.token, 'jerjg')
                ChatUser
                    .findOne({_id: decoded.userId})
                    .then(doc=>{
                        socket.emit('auth/AUTH_INFO',
                            {name: doc.name,
                            chats: doc.chats,
                            avatarColor: doc.avatarColor
                            })
                    })
            }
            else{
                socket.emit('auth/AUTH_ERROR', {error: "token is required"})
            }
        })
        socket.on('disconnect', () => {
            console.log('user disconnected');
        })
}