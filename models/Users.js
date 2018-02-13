const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category:{
    type: String,
    required: true
  },
  spec:{
    type: String
  },
  phoneno:{
    type: String
  }
});

mongoose.model('users', UserSchema);
// module.exports = mongoose.model('users', UserSchema);