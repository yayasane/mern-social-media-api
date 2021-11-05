import { Router } from 'express'
import Message from '../models/message.model.js'
import Conversation from '../models/conversation.model.js'
import { io } from '../index.js'
import SocketUsers from '../SocketUsers.js'
const router = Router()
//add

router.post('/', async (req, res) => {
  const newMessage = new Message(req.body)
  const conversation = await Conversation.findOne({
    conversationId: newMessage.conversationId,
  })
  console.log(SocketUsers.users)

  const senderId = newMessage.sender
  const receiverId = conversation.members.find(
    (memberId) => memberId !== senderId,
  )
  console.log(conversation.members)
  const user = SocketUsers.getUser(receiverId)

  try {
    const savedMessage = await newMessage.save()
    user &&
      io
        .to(user.socketId)
        .emit('getMessage', { senderId, text: newMessage.text })
    console.log(user)
    res.status(200).json(savedMessage)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get

router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
    res.status(200).json(messages)
  } catch (err) {
    res.status(500).json(err)
  }
})

/* const getUser = (userId) => {
  return socketUsers.users.find((user) => user.userId === userId)
} */

export default router
