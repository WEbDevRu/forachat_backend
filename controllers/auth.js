const mongoose = require("mongoose");
const ChatUser = require('../models/user')
const Chat = require('../models/chat')
const jwt = require("jsonwebtoken");


module.exports = (socket) => {

        socket.on('auth/REGISTRATION', (data)=>{
            if(data.name && data.name.length > 1){

                let avatarColors = ["#5d4038", "#5c6bc0", "#ec417b", "#689f39", "#c2175b", "#018a7a", "#5c6bc0", "#0288d1", "#00579c", "#bf360c", "#7e57c2", "#00887a"]
                let getRandomInt = (max) => {
                    return Math.floor(Math.random() * max);
                }
                let getRandomColor = () =>{
                    return avatarColors[getRandomInt(avatarColors.length)]
                }

                let userId = mongoose.Types.ObjectId()
                let chatId = mongoose.Types.ObjectId()
                //generate random color from list for user (or chat) avatar
                let avatarColor = getRandomColor()
                let currentDate = new Date()

                //generate token for user authentication, this token will store in cookie
                const token = jwt.sign(
                    {
                        userId: userId
                    },
                    'jerjg',
                {}
                )


                //create new chat with user name
                const newChat = new Chat({
                    _id: chatId,
                    creator: userId,
                    name: data.name,
                    avatarColor: avatarColor,
                    members: [userId],
                    lastMessage: {author: data.name, text: "Chat created", date: currentDate},
                    totalMembers: 1,
                    creationDate: currentDate
                })

                //create new user
                const User = new ChatUser({
                    _id: userId,
                    name: data.name,
                    chats: [chatId],
                    token: token,
                    avatarColor: avatarColor,
                    regDate: currentDate
                })





                Promise.all([newChat.save(), User.save()])
                    .then(response =>{
                        //if saving the records was successful, send signal to client, with auth data
                        socket.emit('auth/REGISTRATION_SUCCESS', {
                            token: response[1].token,
                            name: data.name,
                            avatarColor: avatarColor,
                            chats: [{
                                _id: response[0]._id,
                                name: data.name,
                                avatarColor: avatarColor,
                                lastMessage: {author: data.name, text: "Chat created", date: currentDate},
                                totalMembers: 1
                            }]
                        })
                    })
                    .catch(error=>{
                        socket.emit('auth/REGISTRATION_ERROR', {error: "server error"})
                    })
            }
            else{
                socket.emit('auth/REGISTRATION_ERROR', {error: "name is required"})
            }
        })


        //authentication event, calls each time the user logs in
        socket.on('auth/AUTH', async (data) =>{

            if(data.token){
                const decoded = jwt.verify(data.token, 'jerjg')
                //get user chats list form DB
                let chatsId = await ChatUser
                    .findOne({_id: decoded.userId})
                    .then(doc => (doc.chats))
                let chatsList = await Chat.find({_id: chatsId}).then(docs=>docs)

                chatsList = chatsList.map((item) =>({
                    _id: item._id,
                    name: item.name,
                    avatarColor: item.avatarColor,
                    lastMessage: item.lastMessage,
                    totalMembers: item.totalMembers
                }))

                //get user info form DB
                ChatUser
                    .findOne({_id: decoded.userId})
                    .then(doc=>{
                        //send authentication information to client
                        socket.emit('auth/AUTH_INFO',
                            {name: doc.name,
                            chats: chatsList,
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