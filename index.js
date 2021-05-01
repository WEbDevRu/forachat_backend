const mongoose = require("mongoose");
require('dotenv').config()

const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

mongoose.connect(
    'mongodb+srv://nikrainev:'+process.env.DB_PASSWORD+'@cluster0.drt1e.mongodb.net/Cluster0?retryWrites=true&w=majority'
    ,
    {
        useNewUrlParser: true
    })


io.on("connection", (socket) => {
    require("./controllers/auth")(socket, io)
})

const PORT = 8081;




server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});