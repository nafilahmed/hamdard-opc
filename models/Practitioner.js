const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PractitionerSchema = new Schema({
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  amount:{
    type: Number,
    required: true
  }
});

mongoose.model('practitioners', PractitionerSchema);