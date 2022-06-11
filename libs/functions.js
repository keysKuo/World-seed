exports.normalizeDateAndTime = function (date) {
	var hourString = date.getHours();
	var minuteString = date.getMinutes();

	if (hourString < 10) {
		hourString = '0' + hourString;
	}

	if (minuteString < 10) {
		minuteString = '0' + minuteString;
	}


	var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return month[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' At ' + hourString + ':' + minuteString;
}

exports.normalizeDate = function (date) {
	var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return month[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear();
}


exports.validatorSignUp = function (req, res, next) {
	const isEmailValid = (email) => {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}; 
	// REGES

	// const checkUsername = (username) => {
	// 	return !username.includes(' ') && username.length < 16;
	// }

	// if (!checkUsername(req.body.username)) {
	// 	return res.render('login', { msg: 'Username is invalid' });
	// }

	if (!isEmailValid(req.body.email)) {
		return res.render('login', { msg: 'Email is invalid' });
	}

	next();
}

exports.calculateAge = function (birthday) { // birthday is a date
	var ageDifMs = Date.now() - birthday.getTime();
	var ageDate = new Date(ageDifMs); // miliseconds from epoch
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

