module.exports = (socket) => {
        socket.emit('message', "this is a test2");
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        })
}