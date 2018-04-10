if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://cmad786:hamdard123@ds223738.mlab.com:23738/hamdard-opc'}
  } else {
    module.exports = {mongoURI: 'mongodb://localhost/fyp'}
  }