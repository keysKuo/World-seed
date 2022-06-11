var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
const Blogs = require('../models/Blogs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const pathapi = require('path');
const fileapi = require("../libs/libfiles")
const allow_extension = ["png", "jpg", "gif", "jpeg", "txt"]
const upload_dir = pathapi.join(__dirname, "../uploads")
const multiparty = require('multiparty');
const { normalizeDate, calculateAge, validatorSignUp } = require('../libs/functions')



router.post('/register', validatorSignUp, (req, res) => {
	var myUser = {
		username: req.body.username,
		email: req.body.email,
		dob: req.body.dob,
		password: req.body.password,
		phone: '',
		personal_concept: '',
		main_color: '',
		avatar: '',
		blog_counter: 0,
		user_bio: '',
	}

	// kiểm tra user có tồn tại
	Users.findOne({ email: req.body.email }, (err, user) => {
		if (err) {
			return res.render('login', { msg: err })
		}
		if (user) {
			return res.render('login', { msg: 'This email is existed.' });
		}
		req.session.temporary = myUser;
		return res.render('update');
	})

})

router.get('/update', (req, res, next) => {
	res.render('update');
})

router.post('/update', (req, res, next) => {
	const form = new multiparty.Form()
	form.parse(req, (err, fields, files) => {

		if (err) {
			return res.render("update", { message: err.message, ...fields })
		}

		if (!files.photo || files.photo.length == 0) {
			return res.render("update", { message: "Chưa chọn file hình", ...fields });
		}


		let path = files.photo[0].path
		let filename = files.photo[0].originalFilename //lấy tên file
		let parts = filename.split('.')
		let ext = parts[parts.length - 1].toLowerCase() //lấy phần mở rộng
		// check xem file ảnh thuộc mảng
		if (!allow_extension.find(s => s == ext)) {
			return res.render("update", { message: "Vui lòng chọn file hình", ...fields })
		}
		//lấy tên upload lên để lưu nhưng sẽ thêm số phía sau nếu trùng tên

		let newname = filename.substr(0, filename.length - ext.length - 1)
		let idx = ""
		//cố định phần mở rộng là png vì người dùng có thể upload 2 file cùng tên khác phần mở rộng thì hệ thống sẽ không thể lưu 2 file ghi chú cùng tên với phần mở rộng là txt được.
		//có thể không cần cố định phần mở rộng bằng cách dùng tên file ngẫu nhiên
		ext = "png"
		filename = newname + '.' + ext
		while (fileapi.isexist(pathapi.join(upload_dir, filename))) {
			if (!idx)
				idx = 1
			else
				idx += 1
			filename = newname + idx.toString() + '.' + ext
			// console.log(upload_dir, filename)
		}
		let newpath = pathapi.join(upload_dir, filename)

		fileapi.move(path, newpath, (err) => {
			if (err)
				return res.render("update", { message: "không thể lưu tập tin: " + err.message, ...fields })
			//lưu ghi chú nếu có
			if (fields.note && fields.note.length > 0 && fields.note[0]) {
				fileapi.writefile(pathapi.join(upload_dir, newname + idx.toString() + '.txt'), fields.note[0], err => {
					if (err)
						console.log('Lưu ghi chú bị lỗi:', err)
				})
			}
		})

		var current_user = req.session.temporary;
		current_user.personal_concept = fields.personal_concept[0];
		current_user.phone = fields.phone[0];
		current_user.main_color = fields.main_color[0];
		current_user.avatar = filename;
		current_user.user_bio = fields.user_bio[0];

		bcrypt.hash(current_user.password, saltRounds, function (err, hash) {
			if (err) {
				return res.json({ success: false, msg: err });
			}

			current_user.password = hash;
			// new Users(current_user).save().then(res.redirect('/users/login'));
			new Users(current_user).save().then(res.redirect('/users/login'));
		});


	})
})

// router.get('/register', (req, res) => {
// 	res.render('register');
// })

router.get('/login', (req, res) => {
	req.session.destroy();
	return res.render('login');
})

//redirect là khi không gửi gì gì
//redener là muốn render trang đó với dữ liệu 
router.post('/login', (req, res, next) => {
	if (!req.body.email) {
		return res.render('login', { msg: 'Vui lòng nhập tài khoản' })
	}

	Users.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res.render('login', { msg: 'Username does not exist' });
			}

			bcrypt.compare(req.body.password, user.password, function (err, result) {
				if (result) {
					req.session.user = user;
					return res.redirect('/');
				}
				else {
					return res.render('login', { username: req.body.username, msg: 'Mật khẩu không chính xác' });
				}
			});
			// if (req.body.password === user.password) {
			// 	req.session.user = user;
			// 	return res.redirect('/');
			// } else {
			// 	return res.render('login', { username: req.body.username, msg: 'Mật khẩu không chính xác' });
			// }

		})
		.catch(next)
})


router.get('/contact', (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/users/login');
	}

	var current_user = req.session.user;

	return res.render('contact', {
		layouts: true,
		main_color: current_user ? current_user.main_color : 'black',
		data: current_user
	});
})

/* GET users listing. */
router.get('/', function (req, res, next) {
	if (!req.session.user) {
		return res.redirect('/users/login');
	}

	res.sendStatus("404", { status: '404 Not Found' });
});




router.get('/:slug', (req, res, next) => {
	Users.findOne({ slug: req.params.slug })
		.then(user => {
			if (!user) {
				return res.render('about', { msg: '404 Not Found' });
			}


			var data = [];
			Blogs.find({ "author.username": user.username }, (err, blogs) => {
				if (err) {
					return res.json({ success: false, msg: err });
				}

				data = blogs.map(blog => {
					return {
						authorName: user.username,
						title: blog.title,
						content: blog.content,
						image: blog.image,
						avatar: user.avatar,
						description: blog.description,
						createdAt: normalizeDate(blog.createdAt),
						slug: blog.slug,
					}
				})

				const current_user = req.session.user

				return res.render('about', {
					googleId: (current_user && current_user.googleId) ? current_user.googleId : '',
					layouts: true,
					main_color: user.main_color,
					concept: user.personal_concept,
					user_bio: user.user_bio,
					avatar: user.avatar,
					username: req.session.user ? req.session.user.username : 'Người lạ',
					bloggerName: user.username,
					status: req.session.user ? 'Logout' : 'Login',
					data: data,
				});
			});
		})
		.catch(next);

})

router.post('/:slug/edit', (req, res, next) => {
	// var data = {phone: req.body.phone, user_bio: req.body.user_bio}
	Users.findOne({ slug: req.params.slug })
		.then((user) => {
			var data = { ...user._doc, phone: req.body.phone, user_bio: req.body.user_bio };

			user.delete();
			new Users(data).save().then(res.redirect('/'))

		})
		.catch(next)
})

router.get('/:slug/edit', (req, res, next) => {
	Users.findOne({ slug: req.params.slug })
		.then(user => {
			if (!user) {
				return res.send('404 Not found');
			}

			var data = {
				slug: user.slug,
				username: user.username,
				email: user.email,
				dob: !user.dob ? 'Chưa có' : calculateAge(user.dob),
				phone: user.phone ? user.phone : 'Chưa có',
				blog_counter: user.blog_counter,
				user_bio: user.user_bio ? user.user_bio : 'Chưa có',
				slug: user.slug,
			}

			// return res.render('user', { username: req.session.username ? req.session.username : 'Người lạ', data: data })

			return res.render('edit', { data: data })
		}).catch(next)
	// res.render('edit')
})



// router

module.exports = router;

