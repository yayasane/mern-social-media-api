const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const usersRoute = require('./routes/users.routes')
const authRoute = require('./routes/auth.routes')
const postRoutes = require('./routes/post.routes')
const cors = require('cors')
dotenv.config()

const app = express()
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ['sessionId', 'Content-Type'],
  exposedHeaders: ['sessionId'],
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

//middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.use('/api/users', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoutes)

app.listen(8800, () => {
  console.log('Backend server in running')
})
