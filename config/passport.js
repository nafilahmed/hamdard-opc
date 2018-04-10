const LocalStrategy  = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const Users = mongoose.model('users');

module.exports = function(passport){
  passport.use('user-local',new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // Match user
    Users.findOne({
      email:email,
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No User Found'});
      } 

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          if (user.category == "doctor") {
            Users.updateOne({"email": user.email},{$set:{"status":"login"}})
            .then(patinfo =>{
              console.log("login_updated");
            });
          }
          return done(null, user);
        } else {
          return done(null, false, {message: 'Password Incorrect'});
        }
      })
    })
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    Users.findById(id, function(err, user) {
      done(err, user);
    });
  });
}