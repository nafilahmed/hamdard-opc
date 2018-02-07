const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const chatSchema = new Schema({
  author:{
    type: String,
    required: true
  },
  message:{
    type: String,
    required: true
  },
  room:{
    type: String,
    required: true
  },

})
mongoose.model('chatData', chatSchema);