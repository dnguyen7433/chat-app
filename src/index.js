const express = require ("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages.js")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users.js")
//Create the express application
const app = express()
//Create the HTTP server using the Express app
const server = http.createServer(app)
//Connect socket.io to the HTTP server
const io = socketio(server)
//Express config
const publicDirectoryPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000
app.use(express.static(publicDirectoryPath))


//Listen for new connections to Socket.io
io.on("connection", (socket) => {
    console.log("New WebSocket Connection")
    socket.emit("message", generateMessage ("Chat App","Welcome to Chat App"))
    socket.on("sendMessage", (mes, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(mes)){
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit("message", generateMessage(user.username,mes) )
        callback()
    })
    socket.on("join", ({username, room}, callback) => {
        
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage("Chat App",`Welcome, ${user.username}`))
        socket.broadcast.to(user.room).emit("message", generateMessage("Chat App",`${user.username} has joined!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if(user){
            io.emit("message", generateMessage("Chat App",`${user.username} has left`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
     
    })
    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id)
        
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log(`The server is up on Port ${port}`)
})