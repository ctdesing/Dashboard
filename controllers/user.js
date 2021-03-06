const User = require('../models/user');

module.exports = {
	index(req, res, next) {
		User.find({}, (err, users) => {
			if (err) next(err);
			else {
				res.render('index', {site: './administrators/users', title: 'Jhon Nieves', users, url: "/users"});
			}
		});
	},
	create(req, res, next) {
		let isAdmin = false;

		if (req.body.admin == "true")
			isAdmin = true;

		const newUser = new User({
			username: req.body.username,
			email: req.body.username,
			name: req.body.name,
			isAdmin: isAdmin
		});
		User.register(newUser, req.body.password, (err, user) => {
		  if (err) {
		    next(err);
		  }
		  else {
		  	res.redirect(req.body.url);
		  }
		});
	},
	profile(req, res, next) {
		User.findById(req.params.id, function(err, user){
			if (err) next(err);
			else res.json(user);
		});
	},
	update(req, res, next) {
		const userNewData = {
			username: req.body.username,
			email: req.body.username,
			name: req.body.name,
		};
		User.findByIdAndUpdate(req.params.id, userNewData, function(err){
			if (err) next(err);
			else {
				res.redirect(req.body.url);
			}
		});
	},
	destroy(req, res, next) {
		User.findByIdAndRemove(req.params.id, (err)=>{
			if(err) next(err);
			else {
				req.flash('info', 'User deleted successfully.');
				res.redirect(req.body.url);
			}
		});
	}
};