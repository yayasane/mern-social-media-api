import mongoose from 'mongoose'
const { Schema, model } = mongoose

const ConversationSchema = new Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true },
)

export default model('Conversation', ConversationSchema)
