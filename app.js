const express = require('express.io');
const path = require('path');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const fs = require('fs');
// const text = require('textbelt');
const app = express();
app.http().io();

// Load User Model
require('./models/Users');
// Load chat model
require('./models/chatData');
const Users = mongoose.model('users');
const chatData = mongoose.model('chatData');
// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/database');

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(db.mongoURI, {
//   useMongoClient: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

//set the engine
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Express session midleware
app.use(session({
  secret: 'secrets',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function(req, res, next){
	res.locals.error = req.flash('error') || null ;
	res.locals.user = req.user || null;
	next();
});

//Index Route
app.get('/', (req, res) => {
  res.render('index');
});
//Login Route
app.get('/login', (req, res) => {
  res.render('login');
});
//Patient Route
app.get('/patient', (req, res) => {
  res.render('patient');
  
});
//Registration Route
app.get('/registeration', (req, res) => {
  res.render('registeration');
});
//user route patient/doctor
app.get('/user', (req, res) => {
	if (req.user) {
		if (req.user.category == "Patient") {
			Users.find({"category": "Doctor"})
			.then(doctors => {
				if(doctors){
					res.render('user',{
						doctors : doctors,
					});
			//res.render('user');
				}
			});	
		}else{
			Users.find({"category": "Doctor"})
			.then(doctors => {
				if(doctors){
					//errors.push({text:'Email already exits'});
					res.render('doctor',{
						doctors : doctors,
					});
			//res.render('user');
				}
			});

		}
	}
	else{
		res.render('login',{
			error : "Login First"
		});		
	}
});
//chat/websocket route
app.get('/chat', (req, res) => {
	if (req.user) {
		Users.findById(req.param('id').split('-')[0], function (err, doc){
			if (!doc) { doc = {} }
			res.render('chat',{
				docname : doc.username,
				id: req.param('id')
			});
		});
		// fs.readFile('chat1.txt', function(err, data) {
		// 	res.writeHead(200, {'Content-Type': 'text/html'});
		// 	res.write(data);
		// 	res.end();
		// 	console.log("reading file")
		//   });
	}
	else{
		res.render('login',{
			error : "Login First"
		});
	} 
});
//video/WebRTC route
app.get('/video', function(req, res){
	if (req.user) {
		Users.findById(req.param('q').split('-')[0], function (err, doc){
			if (!doc) { doc = {} }
			res.render('video',{
				docname : doc.username,
				id: req.param('q')
			});
		});
	}
	else{
		res.render('login',{
			error : "Login First"
		});		
	}
});
// Login Form POST
app.post('/login',(req, res, next)=>{
  passport.authenticate('user-local', {
    successRedirect:'/user',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);

});
// Logout User
app.get('/logout', (req, res) => {
  req.logout();
  // req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});
// Register Form POST
app.post('/registeration',(req,res)=>{
	var errors =[];

	if(!req.body.email){
		errors.push({text:'Enter email'});
	}

	if(!req.body.username){
		errors.push({text:'Enter username'});
	}

	if(req.body.password != req.body.password2){
		errors.push({text:'Passwords do not match'});
	}

	if(req.body.password.length < 4){
		errors.push({text:'Password must be at least 4 characters'});
		}

	if (errors.length > 0) {
		res.render('registeration',{
			errors : errors,
			username : req.body.username,
			email : req.body.email,
			password : req.body.password,
			password2 : req.body.password2,
			category : req.body.cat
		});
	}else{
		Users.findOne({email: req.body.email})
		.then(user => {
			if(user){
				errors.push({text:'Email already exits'});
				res.render('registeration',{
					errors : errors,
					username : req.body.username
				});
			}else{
				const newUser = new Users({
		            username: req.body.username,
		            email: req.body.email,
		            password: req.body.password,
		            category: req.body.cat
		        });
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						newUser.password = hash;
						newUser.save()
					    .then(user => {
					    	//req.flash('success_msg', 'You are now registered and can log in');
					    	res.render('login');
					    })
					    .catch(err => {
					    	console.log(err);
					    	return;
					    });
					});
				});
			}
		});
	}
});

const port = process.env.PORT || 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});


app.io.route('ready', function(req) {
	req.io.join(req.data.chat_room);
	chatData.find({room: req.data.chat_room}).then(result => {
		console.log('data: ', result)
		result.map(a => {
			req.io.emit('message', a)
		})
	});
	req.io.join(req.data.signal_room);
	// app.io.room(req.data).broadcast('announce', {
	// 	message: 'New client in the ' + req.data + ' room.'
	// })
});

app.io.route('send', function(req) {
    app.io.room(req.data.room).broadcast('message', {
        message: req.data.message,
		author: req.data.author
	});

	const newChat = new chatData({
		author: req.data.author,
		message: req.data.message,
		room: req.data.room
	});
	newChat.save(function(error){
		console.log("Chat has been saved!");
		if(error){
			console.log("error",error);
		}
	})
    // })
	// let arr = [];
	// let file =  `chat-${req.data.room}.json`;
	// if (fs.existsSync(file)) {
	// 	let localArr = JSON.parse(fs.readFileSync(file, 'utf8'));
	// 	if (Array.isArray(localArr)) {
	// 		arr = localArr
	// 	}
	// }
	// arr.push({message:req.data.message,author:req.data.author});
	// console.log(arr)
	// fs.writeFile(file,JSON.stringify(arr, null,4),'utf8',function (err) {
	// 	if (err) throw err;
	// 	console.log('Saved!');
	//  });
});

app.io.route('signal', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.room).broadcast('signaling_message', {
        type: req.data.type,
		message: req.data.message
    });
});

app.io.route('request', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.docid).broadcast('request', req.data);
	//Twillio variables
	const accountSid = 'AC65c8d3d2adbd1d8ee857ee09d9cb5007';
    const authToken = 'fec629ef370ad8ac8680256ab31571a3';
    const client = require('twilio')(accountSid, authToken);
// console.log(client)

   //sending message
   client.messages.create({
	   to: '+923068647267',
	   from: '(234) 294-1674',
	   body: 'Please check the Patient https://hamdard-opc.herokuapp.com/'
     });
});

app.io.route('win', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.room).broadcast('window', {
        type: req.data.type,
		message: req.data.message
    });
});

// const accountSid = 'AC65c8d3d2adbd1d8ee857ee09d9cb5007';
// const authToken = 'fec629ef370ad8ac8680256ab31571a3';
// const client = require('twilio')(accountSid, authToken);
// // console.log(client)

// //sending message
// client.messages.create({
// 	to: '+923068647267',
// 	from: '(234) 294-1674',
// 	body: 'Please check the Patient https://hamdard-opc.herokuapp.com/'
//   });