const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const usersRoute = require('./routes/users.routes')
const authRoute = require('./routes/auth.routes')
const postRoutes = require('./routes/post.routes')
const conversationRoutes = require('./routes/conversation.routes')
const messageRoutes = require('./routes/message.routes')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
dotenv.config()

const app = express()

// ajout de socket.io
const server = require('http').createServer(app)
const io = (module.exports.io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
}))

const corsOptions = {
  origin: '*',
  credentials: true,
  allowedHeaders: [
    'Orgin',
    'Accept',
    'X-Request-With',
    'Content-Type',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'authorization',
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'authorization',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
}
app.use(cors(corsOptions))

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) console.log('Connected to MongoDB')
    else console.log('Connexion error: ' + err)
  },
)

//Quand on un requête vers cette path, ne construit pas de requête, vas simplement dans le dosssier public/images
app.use('/images', express.static(path.join(__dirname, 'public/images')))

//middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    // console.log(req.body.name)
    //req.body n'a peut-être pas encore été entièrement renseigné. Cela dépend de l'ordre dans lequel le client transmet les champs et les fichiers au serveur.
    cb(null, req.body.name)
  },
})

const upload = multer({ storage: storage })

app.post('/api/upload', upload.single('file'), (req, resp) => {
  console.log(req.body.name)
  try {
    return resp.status(200).send('File uploaded succesfully')
  } catch (error) {
    console.log(err)
  }
})

app.use('/api/users', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', messageRoutes)

server.listen(process.env.PORT || 8800, (res, err) => {
  console.log(res)
  console.log('Backend server in running')
})
// const SocketManager = require('./SocketManager')
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
io.on('connection', (socket) => {
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
    user && io.to(user.socketId).emit('getMessage', { senderId: userId, text })
  })

  //When disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnect')
    removeUser(socket.id)
    io.emit('getUsers', users)
  })
})
