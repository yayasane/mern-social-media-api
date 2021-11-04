const io = require('./index.js').io

let users = []

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId })
}

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

module.exports = (socket) => {
    //when connect
    console.log('a user connected')
  
    //take userId and socketId from user
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id)
      io.emit('getUsers', users)
    })
  
    //send and get message
    socket.on('sendMessage', ({ userId, receiverId, text }) => {
      const user = getUser(receiverId)
      io.to(user.socketId).emit('getMessage', { senderId: userId, text })
    })
  
    //When disconnect
    socket.on('disconnect', () => {
      console.log('a user disconnect')
      removeUser(socket.id)
      io.emit('getUsers', users)
    })
}
