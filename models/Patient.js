const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PatientSchema = new Schema({
  username:{
    type: String,
    required: true
  },
  nic:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dateofbirth:{
    type: String,
    required: true
  },
  gender:{
    type: String,
    required: true
  }
});

mongoose.model('patients', PatientSchema);