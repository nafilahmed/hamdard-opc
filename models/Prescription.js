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
  docid:{
    type: String,
    default: "not define"
  },
  patname:{
    type: String,
    required: true
  },
  docname:{
    type: String,
    default: "not define"
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
    default: "not required"
  },
  medamount:{
    type: Array,
    default: "not required"
  },
  mdtime:{
    type: Array,
    default: "not required"
  },
  comment:{
    type: String,
    default: "none"
  },
  visit:{
    type: Number,
    required: true
  }
});
mongoose.model('prescriptions', PrescriptionSchema);