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
const { normalizeDate, calculateAge, validatorSignUp, normalizeDateAndTime } = require('../libs/functions')



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

router.get('/edit', (req, res, next) => {
	return res.render('editprofile')
})
router.post('/edit', (req, res, next) => {
	const form = new multiparty.Form()
	form.parse(req, (err, fields, files) => {

		if (err) {
			return res.render("editprofile", { message: err.message, ...fields })
		}

		if (!files.photo || files.photo.length == 0) {
			return res.render("editprofile", { message: "Chưa chọn file hình", ...fields });
		}


		let path = files.photo[0].path
		let filename = files.photo[0].originalFilename //lấy tên file
		let parts = filename.split('.')
		let ext = parts[parts.length - 1].toLowerCase() //lấy phần mở rộng
		// check xem file ảnh thuộc mảng
		if (!allow_extension.find(s => s == ext)) {
			return res.render("editprofile", { message: "Vui lòng chọn file hình", ...fields })
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
				return res.render("editprofile", { message: "không thể lưu tập tin: " + err.message, ...fields })
			//lưu ghi chú nếu có
			if (fields.note && fields.note.length > 0 && fields.note[0]) {
				fileapi.writefile(pathapi.join(upload_dir, newname + idx.toString() + '.txt'), fields.note[0], err => {
					if (err)
						console.log('Lưu ghi chú bị lỗi:', err)
				})
			}
		})

		Users.findOne({ email: req.session.user.email })
			.then(current_user => {
				current_user.personal_concept = fields.personal_concept[0];
				current_user.phone = fields.phone[0];
				current_user.main_color = fields.main_color[0];
				current_user.avatar = filename;
				current_user.user_bio = fields.user_bio[0];
				current_user.save()
				return res.redirect('/')

			})
			.catch(next)
	})
})

router.post('/update-info/:id', (req, res, next) => {
	const {slug, location, job, status, fav, link} = req.body;

	Users.findOne({slug})
		.then(user => {
			user.location = location;
			user.job = job;
			user.relationship_status = status;
			user.favorite = fav;
			user.social_link = link;

			user.save();
		})
		.catch(next);
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

// forgot password
router.post('/forgotpassword', (req, res, next) => {
	const { username, email } = req.body;
	// console.log(username)
	// console.log(email)

	Users.findOne({ username, email })
		.then(user => {
			var newpassword = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
			bcrypt.hash(newpassword, saltRounds, function (err, hash) {
				if (err) {
					return res.json({ success: false, msg: err });
				}
				user.password = hash;
				// new Users(current_user).save().then(res.redirect('/users/login'));
				user.save();
			});
			return res.render('login', {
				msgSuccess: "Mật khẩu mới của bạn là: " + newpassword,
			});
		})
		.catch(next)
})

// change password
router.get('/changepassword', (req, res, next) => {
	return res.render('changepassword');
})

router.post('/changepassword', (req, res, next) => {
	const { old_password, new_password_1, new_password_2 } = req.body;
	if (new_password_1 != new_password_2) {
		return res.render('changepassword', {
			msg: "Mật khẩu mới phải giống nhau"
		});
	}
	Users.findOne({ email: req.session.user.email })
		.then(current_user => {
			bcrypt.compare(old_password, current_user.password, function (err, result) {
				if (result) {
					bcrypt.hash(new_password_1, saltRounds, function (err, hash) {
						if (err) {
							return res.json({ success: false, msg: err });
						}
						current_user.password = hash;
						// new Users(current_user).save().then(res.redirect('/users/login'));
						current_user.save();
					});
					return res.redirect('/')
				}
				else {
					return res.render('changepassword', { msg: 'Mật khẩu không chính xác' });
				}
			});
		})
		.catch(next)

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
			var like_counter = 0;
			Blogs.find({ "author.username": user.username }, (err, blogs) => {
				if (err) {
					return res.json({ success: false, msg: err });
				}


				data = blogs.map(blog => {
					like_counter += blog.likers.length;
					return {
						authorName: user.username,
						title: blog.title,
						content: blog.content,
						image: blog.image,
						avatar: user.avatar,
						description: blog.description,
						createdAt: normalizeDate(blog.createdAt),
						num_likes: blog.likers.length,
						slug: blog.slug,
					}
				})

				const current_user = req.session.user
				const current_slug = req.session.user ? req.session.user.slug : 'Người lạ';

				return res.render('about', {
					googleId: (current_user && current_user.googleId) ? current_user.googleId : '',
					layouts: true,
					main_color: user.main_color,
					concept: user.personal_concept,
					user_bio: user.user_bio,
					avatar: user.avatar,
					username: req.session.user ? req.session.user.username : 'Người lạ',
					bloggerName: user.username,
					status: req.session.user ? 'Đăng xuất' : 'Đăng nhập',
					hidebox: true,
					signed: current_user ? true : false,
					data: data.reverse(),
					slug: current_slug,

					bloggerEmail: user.email,
					bloggerPhone: user.phone,
					bloggerDOB: normalizeDate(user.dob),
					bloggerCreatedAt: normalizeDateAndTime(user.createdAt),
					blogCounter: user.blog_counter,

					bloggerLocation: user.location ? user.location : 'Chưa cập nhật',
					bloggerJob: user.job ? user.job : 'Chưa cập nhật',
					bloggerRela: user.relationship_status ? user.relationship_status : 'Chưa cập nhật',
					bloggerFav: user.favorite ? user.favorite : 'Chưa cập nhật',
					bloggerLink: user.social_link ? user.social_link : 'Chưa cập nhật',
					bloggerLike: like_counter,

					auth: (req.session.user && (req.session.user.slug == req.params.slug)) ? true : false,

				});
			});
		})
		.catch(next);
})

// router

module.exports = router;

