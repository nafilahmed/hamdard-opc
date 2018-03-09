const express = require('express.io');
const path = require('path');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const twilio = require('twilio');
const fs = require('fs');

const app = express();
app.http().io();
// DB Config
const db = require('./config/database');

mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect(db.mongoURI, {
	//   useMongoClient: true
})
	.then(() => console.log('MongoDB Connected...'))
	.catch(err => console.log(err));


require('./models/Users');
const Users = mongoose.model('users');

require('./models/Patient');
const Patient = mongoose.model('patients');

require('./models/Doctor');
const Doctor = mongoose.model('doctors');

require('./models/Practitioner');
const Practitioners = mongoose.model('practitioners');

require('./models/Prescription');
const Prescriptions = mongoose.model('prescriptions');

// Passport Config
require('./config/passport')(passport);

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get('/', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('practitioner',{
					practitioner : practitioner,
				});
			});
		}else if (req.user.category == "patient") {
			Patient.find({"nic": req.user.email})
			.then(patient =>{
				res.render('patient',{
					patient : patient,
				});
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('index');		
	}
});

app.get('/login', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('practitioner',{
					practitioner : practitioner,
				});
			});
		}else if (req.user.category == "patient") {
			Patient.find({"nic": req.user.email})
			.then(patient =>{
				res.render('patient',{
					patient : patient,
				});
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('login');		
	}
});

app.post('/login',(req, res, next)=>{
	passport.authenticate('user-local', {
		successRedirect:'/',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next);
});

app.get('/doctorcategory',(req,res)=>{
	if (req.user) {
		if (req.user.category == "patient") {
			Prescriptions.find({"patid": req.user._id}).count()
			.then( vesit =>{
				var d = new Date();
				var n = d.getTime();
				const newPrescriptions = new Prescriptions({
			        time : n,
			        patid: req.user._id,
			    	patname: req.user.username,
					patage: req.param('patage'),
					pattemp: req.param('pattemp'),
					patblood1: req.param('patblood1'),
					patblood2: req.param('patblood2'),
					patsugar1: req.param('patsugar1'),
					patsugar2: req.param('patsugar2'),
					visit: vesit+1
			    });
			    newPrescriptions.save()
			    .then(demo => {
			    	Doctor.distinct("specialization")
					.then(spec => {
						res.render('doctorcategory',{
							spec : spec
						});
					});	
			    });
			});
		}else{
			res.redirect('/');
		}
	}else{
		res.render('index');
	}
});

app.get('/doctorselection',(req,res)=>{
	if (req.user) {
		if (req.user.category == "patient") {
			Doctor.find({"specialization": req.param('spec')})
			.then(doctor => {
				res.render('doctorselection',{
					doctor : doctor
				});
			});
		}else{
			res.redirect('/');
		}
	}else{
		res.render('index');
	}
});

app.get('/call', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('practitioner',{
					practitioner : practitioner,
				});
			});
		}else if (req.user.category == "patient") {
			Doctor.findById(req.param('peerid'), function (err, doc){

			const accountSid = 'AC65c8d3d2adbd1d8ee857ee09d9cb5007';
			const authToken = 'fec629ef370ad8ac8680256ab31571a3';
			const client = require('twilio')(accountSid, authToken);
			//Make a call
			client.calls.create({
				url: 'https://handler.twilio.com/twiml/EHc268de41386b56d246a2ddfffa107426',
				to: '+923473824037',
				from: '(720) 605-3224',
			},function(err, call){
				if(err){
					console.log(err);
				}
				else{
					console.log(call.sid);
				}
			});

				// res.render('patient',{
				// 	patient : patient,
				// });
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('index');		
	}
});

app.get('/pratitionersignup', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('practitioner',{
					practitioner : practitioner,
				});
			});
		}else if (req.user.category == "patient") {
			Patient.find({"nic": req.user.email})
			.then(patient =>{
				res.render('patient',{
					patient : patient,
				});
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('pratitionersignup');		
	}
});

app.get('/chat', (req, res) => {
	if (req.user) {
		if (req.user.category == "patient") {
			res.render('chat',{
				docid: req.param('id')
			});
		}else{
			res.render('chat',{
				doct: "doc",
				docid: req.param('id')
			});
		}
	}
	else{
		res.render('login',{
			error : "Login First"
		});		
	}
});

app.get('/video', function(req, res){
	if (req.user) {
		res.render('video',{
			// docname : doc.username,
			docid: req.param('q')
		});
	}
	else{
		res.render('login',{
			error : "Login First"
		});		
	}
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/pratitionersignup',(req,res)=>{
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
		res.render('pratitionersignup',{
			errors : errors,
			username : req.body.username,
			email : req.body.email,
			password : req.body.password,
			password2 : req.body.password2,
			
		});
	}else{
		Users.findOne({email: req.body.email})
		.then(user => {
			if(user){
				errors.push({text:'Email already exits'});
				res.render('pratitionersignup',{
					errors : errors,
					username : req.body.username
				});
			}else{
				const newUser = new Users({
		            username: req.body.username,
		            email: req.body.email,
		            password: req.body.password,
		            category: "practitioner"
		        });
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						newUser.password = hash;
						newUser.save()
					    .then(user => {
					    	const newPractitioner = new Practitioners({
					            username: req.body.username,
					            email: req.body.email,
					            amount: 0
					        });
					        newPractitioner.save()
					        .then(()=>{
					        	res.render('login');
					        });
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


app.get('/doctorsignup', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('practitioner',{
					practitioner : practitioner,
				});
			});
		}else if (req.user.category == "patient") {
			Patient.find({"nic": req.user.email})
			.then(patient =>{
				res.render('patient',{
					patient : patient,
				});
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('doctorsignup');		
	}
});

app.post('/doctorsignup',(req,res)=>{
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
		res.render('doctorsignup',{
			errors : errors,
			username : req.body.username,
			email : req.body.email,
			password : req.body.password,
			password2 : req.body.password2,
			
		});
	}else{
		Users.findOne({email: req.body.email})
		.then(user => {
			if(user){
				errors.push({text:'Email already exits'});
				res.render('doctorsignup',{
					errors : errors,
					username : req.body.username
				});
			}else{
				const newUser = new Users({
		            username: req.body.username,
		            email: req.body.email,
		            password: req.body.password,
		            category: "doctor"
		        });
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						newUser.password = hash;
						newUser.save()
					    .then(user => {
					    	const newDoctor = new Doctor({
					            username: req.body.username,
					            email: req.body.email,
					            specialization : req.body.spec,
								contact : req.body.contact,
					            amount: 0
					        });
					        newDoctor.save()
					        .then(()=>{
					        	res.render('login');
					        });
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

app.get('/patientsignup', (req, res) => {
	if (req.user) {
		if (req.user.category == "practitioner") {
			Practitioners.find({"email": req.user.email})
			.then(practitioner =>{
				res.render('patientsignup');
			});
		}else if (req.user.category == "patient") {
			Patient.find({"nic": req.user.email})
			.then(patient =>{
				res.render('patient',{
					patient : patient,
				});
			});
		}else{
			Doctor.find({"email": req.user.email})
			.then(doctor =>{
				res.render('doctor',{
					doctor : doctor,
				});
			});
		}
	}
	else{
		res.render('index');		
	}
});

app.post('/patientsignup',(req,res)=>{
	var errors =[];

	if(!req.body.nic){
		errors.push({text:'Enter NIC'});
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
		res.render('patientsignup',{
			errors : errors,
			username : req.body.username,
			email : req.body.nic,
			password : req.body.password,
			password2 : req.body.password2,
			
		});
	}else{
		Users.findOne({email: req.body.nic})
		.then(user => {
			if(user){
				errors.push({text:'Email already exits'});
				res.render('patientsignup',{
					errors : errors,
					username : req.body.username
				});
			}else{
				const newUser = new Users({
		            username: req.body.username,
		            email: req.body.nic,
		            password: req.body.password,
		            category: "patient"
		        });
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						newUser.password = hash;
						newUser.save()
					    .then(user => {
					    	const newPatient = new Patient({
					            username: req.body.username,
					            nic: req.body.nic,
					            password: req.body.password,
					            gender: req.body.gender,
					            dateofbirth: req.body.dateofbirth
					        });
					        newPatient.save()
					        .then(()=>{
					        	res.render('practitioner');
					        });
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
const port = 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});


app.io.route('ready', function(req) {
	req.io.join(req.data.chat_room);
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
	req.io.room(req.data.room).broadcast('request', {
		message: req.data.message
    });
});

app.io.route('chatreply', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.room).broadcast('chatreply', {
		message: req.data.message
    });
});

app.io.route('win', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.room).broadcast('window', {
        type: req.data.type,
		message: req.data.message
    });
});
