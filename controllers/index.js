const mysql = require('mysql'),
			passport = require('passport'),
			User = require('../models/user'),
			{ lastSevenDays, uniqueClients } = require('../table');

//DATABASE CONNECTION MYSQL
var connection = mysql.createConnection({
  host     : 'jancxdashboard.ddns.net',
  port     : '4381',
  user     : 'jancx',
  password : '0100111001',
	multipleStatements: true
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
  }
  else
    console.log('connected as id ' + connection.threadId);
});

module.exports = {
	//
	index(req, res, next) {
		if (req.isAuthenticated()) {
			// DASHBOARD
			res.render('index', {site: 'dashboard', title: 'Jhon Nieves'});
		}
		else {
			res.render('landing', {title: 'Jhon Nieves'});
		}
	},
	chartsApi(req, res, next) {
		connection.query(uniqueClients, function(err, results){
			if (err) next(err);
			else {
				res.json(results);
			}
		});
	},
	//
	signin(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
		if (err) {
			next(err);
		}
		else {
			if (!user) {
				req.flash('error', 'Username or Password incorrect, please try again.');
				res.redirect('/');
			}
			else {
				req.logIn(user, function(err) {
					if (err) {
						next(err);
					}
					else {
						res.redirect('/');
					}
				});
			}
		}
	})(req, res, next);
	},
	//
	signout(req, res, next) {
		req.logout();
		res.redirect('/');
	},
	//
	aps(req, res, next) {
		res.render('index', {site: './administrators/aps', title: 'Jhon Nieves'});
	},
	//
	history(req, res, next) {
		connection.query(lastSevenDays, function(err, results){
		 	if(err) return next(err);
			res.render('index', {site: 'history', title: 'Jhon Nieves', results});
		});
	},
	//
	historyApi(req, res, next) {
		const f = {
			time: req.body.time,
			venues: req.body.venues,
			aps: req.body.aps,
			network:req.body.network,
			filter: req.body.filter,
			start: req.body.start,
			end: req.body.end
		};
		let venuesString = 	"";
		let apsString = "";
		let timeString = "";
		if (f.venues != 'all') {
			venuesString = 	" AND ap_name LIKE '" + f.venues + "'";
		}
		if (f.aps != 'all'){
				apsString = 	" AND ap_name LIKE '" + f.aps + "'";
		}
		// SELECT *FROM cloud_session.UserInfo WHERE start_time <= '2019-06-07' AND start_time >= '2019-06-06 AND end_time <= '2019-06-07' AND end_time >= '2019-06-06';
		//SELECT *FROM cloud_session.UserInfo WHERE start_time >= '2019-03-07' AND end_time <= '2019-06-07
		//SELECT *FROM cloud_session.UserInfo WHERE dl >= '' AND end_time <= '2019-06-07';
		if (f.time == "custom") {
			timeString = "SELECT *FROM cloud_session.UserInfo WHERE start_time >='" + f.start + "' AND end_time <= '" + f.end + "'";
			console.log(timeString);
		}
		else {
			timeString = `SELECT *FROM cloud_session.UserInfo WHERE start_time >= NOW() - INTERVAL ${f.time} DAY`;
		}
		//
		const queryStringBuilder = timeString + venuesString + apsString;
		console.log(queryStringBuilder);
		connection.query(queryStringBuilder, function(err, results){
		 	if(err) next(err);
			else {
				console.log(f.filter);
				if(f.filter.length > 0){
					console.log('=============================================');
					if(f.filter.length == 17){
						console.log("filter pass length");
						let result = [];
						results.forEach(function(user){
							let mac = user.client_mac.replace(/\s/g, "");
							if(mac == f.filter){
								result.push(user);
							}
						});
						res.json(result);
					}
					else {
						req.flash('error', 'MAC Address suplied is invalid, please try again!');
						res.redirect('/history');
					}
				}
				else {
					res.json(results);
				}
			}
		});
	},
	//
	administrators(req, res, next) {
		User.find({}, (err, users) => {
			if (err) next(err);
			else {
				res.render('index', {site: './administrators/administrators', title: 'Jhon Nieves', users, url: "/administrators"});
			}
		});
	}
};
