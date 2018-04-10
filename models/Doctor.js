const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const DoctorSchema = new Schema({
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
  },
  specialization:{
    type: String,
    required: true
  },
  contact:{
    type: String,
    required: true
  },
});

mongoose.model('doctors', DoctorSchema);