class SocketUsers {
  constructor() {
    this.users = []
  }

  addUser(userId, socketId) {
    !this.users.some((user) => user.userId === userId) &&
      this.users.push({ userId, socketId })
  }
  removeUser(socketId) {
    this.users = this.users.filter((u) => u.socketId !== socketId)
  }
  getUser(userId) {
    return this.users.find((user) => user.userId === userId)
  }
}

let SocketUsersInstance = new SocketUsers()

export default SocketUsersInstance
