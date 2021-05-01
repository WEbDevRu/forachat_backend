const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});


io.on("connection", (socket) => {
    require("./controllers/auth")(socket, io)
})

const PORT = 8081;




server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});