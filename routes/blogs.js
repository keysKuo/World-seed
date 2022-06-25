var express = require('express');
const Blogs = require('../models/Blogs');
var router = express.Router();

const pathapi = require('path');
const fileapi = require("../libs/libfiles")
const allow_extension = ["png", "jpg", "gif", "jpeg", "txt"]
const upload_dir = pathapi.join(__dirname, "../uploads")
const multiparty = require('multiparty');
const Users = require('../models/Users');
const Comments = require('../models/Comments');
const { normalizeDate, normalizeDateAndTime } = require('../libs/functions');
const { fstat } = require('fs');


// Blogs.find({}, (err, blogs) => {
// 	if (blogs.length > 0) {
// 		return;
// 	}

// 	var myDefaultBlog = {
// 		username: "Lê Gia Phú",
// 		title: 'The Science of Deduction',
// 		image: 'https://picsum.photos/570/300',
// 		description: 'This is a small description for this blog. Hope you guys enjoy it ^.^',
// 		content: 'Sherlock Holmes took his bottle from the corner of the mantel-piece and his hypodermic syringe from its neat morocco case.',
// 	}

// 	new Blogs(myDefaultBlog).save();
// })

// check session có chưa
router.get('/create', (req, res) => {
	if (!req.session.user) {
		return res.redirect('/users/login');
	}

	res.render('create', { status: 'Đăng Xuất' });
})


router.post('/create', (req, res) => {
	const form = new multiparty.Form()
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.render("create", { message: err.message, ...fields })
		}

		if (!files.photo || files.photo.length == 0) {
			return res.render("create", { message: "Chưa chọn file hình", ...fields });
		}


		let path = files.photo[0].path
		let filename = files.photo[0].originalFilename //lấy tên file
		let parts = filename.split('.')
		let ext = parts[parts.length - 1].toLowerCase() //lấy phần mở rộng
		// check xem file ảnh thuộc mảng
		if (!allow_extension.find(s => s == ext)) {
			return res.render("create", { message: "Vui lòng chọn file hình", ...fields })
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
		fileapi.resize(path, newpath, 1920, 1080);

		fileapi.move(path, newpath, (err) => {
			if (err)
				return res.render("create", { message: "không thể lưu tập tin: " + err.message, ...fields })
			//lưu ghi chú nếu có
			if (fields.note && fields.note.length > 0 && fields.note[0]) {

				fileapi.writefile(pathapi.join(upload_dir, newname + idx.toString() + '.txt'), fields.note[0], err => {
					if (err)
						console.log('Lưu ghi chú bị lỗi:', err)
				})
			}
		})
		
		
		var user = req.session.user;

		var author = {
			username: user.username,
			avatar: user.avatar,
			personal_concept: user.personal_concept,
			main_color: user.main_color,
			user_bio: user.user_bio,
			authorSlug: user.slug,
		}


		var myPost = {
			author: author,
			title: fields.title[0],
			image: filename,
			description: fields.description[0],
			type: fields.type[0],
			content: fields.content[0]
		}

		Users.findOne({ _id: user._id })
			.then(user => {
				new Blogs(myPost).save();
				user.blog_counter++;
				user.save().then(res.redirect('/'))
					
			})		
	})
})

// delete a blog
router.get('/delete/:id', (req, res, next) => {
	Blogs.findOne({ _id: req.params.id })
		.then(blog => {
			if (!blog) {
				return res.redirect('/');
			}

			// var count = req.session.user.blog_counter - 1;
			var userId = req.session.user._id;

			const imgName = blog.image;
			fileapi.unlink(pathapi.join(upload_dir, imgName));

			Users.findOne({_id: userId})
				.then(user => {
					blog.delete();
					user.blog_counter--;
					user.save().then(res.redirect('/'));
				})
		})
		.catch(next);
})


router.post('/edit/:id', (req, res, next) => {
	const { new_content, id } = req.body;
	// console.log(new_content);
	Blogs.findOne({ slug: id })
		.then(blog => {
			blog.content = new_content;
			blog.save();
			return res.redirect(`/blogs/${id}`);
		})
})

router.post('/:id/comments', (req, res, next) => {
	const content = req.body.comment;
	if (!req.session.user) {
		return res.redirect('/users/login');
	}

	if (!content) {
		return res.redirect(`/blogs/${req.session.slug}`);
	}

	var current_user = req.session.user;

	var comment = {
		post_id: req.params.id,
		user: {
			id: current_user._id,
			name: current_user.username,
			avatar: current_user.avatar,
		},
		content: content,
		likes: 0
	}

	new Comments(comment).save();
})


router.get('/:slug', (req, res, next) => {
	req.session.slug = req.params.slug;
	Blogs.findOne({ slug: req.params.slug })
		// đây gọi là promises
		.then(blog => {

			if (!blog) {
				return res.render('blogs', { msg: "Không tìm thấy bài đăng này" });
			}

			const username = req.session.user ? req.session.user.username : 'Người lạ';
			let liked = blog.likers.includes(username);

			const current_slug = req.session.user ? req.session.user.slug : 'Người lạ';
			const current_main_color = req.session.user ? req.session.user.main_color : '#000000';
			const current_concept = req.session.user ? req.session.user.personal_concept : 'World Seed';
			// console.log(liked);

			var data = {
				blog_id: blog._id,
				author: blog.author,
				type: blog.type,
				image: blog.image,
				title: blog.title,
				content: blog.content,
				createdAt: normalizeDateAndTime(blog.createdAt)
			};

			var comments = [];
			Comments.find({ post_id: blog.slug })
				.then(cms => {
					comments = cms.map(c => {
						return {
							post_id: c.post_id,
							user: c.user,
							content: c.content,
							likes: c.likes,
							createdAt: normalizeDateAndTime(c.createdAt)
						}
					})

					return res.render('blog-single', {
						layouts: true,
						liked: liked,
						signed: req.session.user ? true : false,
						num_likes: blog.likers.length,
						id: username == blog.author.username ? blog._id : null,
						concept: blog.author.personal_concept,
						// concept: current_concept,
						main_color: blog.author.main_color,
						// main_color: current_main_color,
						avatar: blog.author.avatar,
						username: username,
						useravatar: req.session.user ? req.session.user.avatar : "",
						// slug: blog.slug,
						slug: current_slug,
						bloggerName: blog.author.username,
						bloggerSlug: blog.author.authorSlug,
						status: req.session.user ? 'Đăng xuất' : 'Đăng nhập',
						data: data,
						comments: comments,
						// hidebox: true,
						googleId: (req.session.user && req.session.user.googleId) ? true : false,
						bloggerBio: blog.author.user_bio,
						slides: true,
					})
				})
				.catch(err => {
					return res.json(err);
				});

		})
		.catch(next);
})

router.post('/:slug', (req, res, next) => {
	console.log(req.body.username, req.body.signal);
	Blogs.findOne({ slug: req.params.slug })
		.then(blog => {
			if (!blog) {
				return res.redirect('/');
			}
			if (req.body.signal) {
				blog.likers.push(req.body.username);
				blog.save();
			}
			else {
				blog.likers.remove(req.body.username);
				blog.save();
			}
		})
		.catch(next);
})



module.exports = router;

