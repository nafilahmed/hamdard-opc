const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PrescriptionSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  patid:{
    type: String,
    required: true
  },
  docemail:{
    type: String,
    required: true
  },
  patname:{
    type: String,
    required: true
  },
  docname:{
    type: String,
    required: true
  },
  patage:{
    type: String,
    required: true
  },
  patblood1:{
    type: String,
    required: true
  },
  patblood2:{
    type: String,
    required: true
  },
  pattemp:{
    type: String,
    required: true
  },
  patsugar1:{
    type: String,
    required: true
  },
  patsugar2:{
    type: String,
    required: true
  },
  mdnam:{
    type: Array,
    required: true
  },
  test:{
    type: Array,
    required: true
  },
  medamount:{
    type: Array,
    required: true
  },
  mdtime:{
    type: Array,
    required: true
  },
  comment:{
    type: String,
    required:true
  },
  patpluse:{
    type: String,
    required: true
  },
  patO2:{
    type: String,
    required: true
  },
  visit:{
    type: Number,
    required: true
  }
});
mongoose.model('prescriptions', PrescriptionSchema);