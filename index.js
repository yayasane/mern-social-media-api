import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import usersRoute from './routes/users.routes.js'
import authRoute from './routes/auth.routes.js'
import postRoutes from './routes/post.routes.js'
import conversationRoutes from './routes/conversation.routes.js'
import messageRoutes from './routes/message.routes.js'
import cors from 'cors'
import multer, { diskStorage } from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import SocketUsers from './SocketUsers.js'

//we need to change up how __dirname is used for ES6 purposes
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config()

const app = express()

// ajout de socket.io
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  //when connect
  console.log('a user connected')

  //take userId and socketId from user
  socket.on('addUser', (userId) => {
    SocketUsers.addUser(userId, socket.id)
    io.emit('getUsers', SocketUsers.users)
  })

  //send and get message
  // socket.on('sendMessage', ({ userId, receiverId, text }) => {
  //   const user = SocketUsers.getUser(receiverId)
  //   user && io.to(user.socketId).emit('getMessage', { senderId: userId, text })
  // })

  //When disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnect')
    SocketUsers.removeUser(socket.id)
    io.emit('getUsers', SocketUsers.users)
  })
})
export { io }

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

const storage = diskStorage({
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
