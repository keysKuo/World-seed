var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
const Blogs = require('../models/Blogs');
const { normalizeDate, count } = require('../libs/functions');
const res = require('express/lib/response');
const { type } = require('express/lib/response');

Users.find({}, (err, users) => {
	// console.log(users)
	// console.log(err)
	if (err) {
		return res.json({ err: err })
	}
	if (users.length != 0) {
		return
	}
	var default_user = {
		username: "Phạm Nhật Vượng",
		email: "phamnhatvuong@vingroup.com.vn",
		password: 123123,
		dob: new Date(1945, 10, 03),
		phone: "028-3622-6888",
		avatar: "august.png",
		user_bio: "This is our Vin Group",
		personal_concept: "We are number #1",
		main_color: "#2155CD",
		blog_counter: 1,
		slug: "pham-nhat-vuong-admin"
	}
	new Users(default_user).save()
})
Blogs.find({}, (err, blogs) => {
	if (err) {
		return res.json({ err: err })
	}
	if (blogs.length != 0) {
		return
	}
	var default_blog = {
		author: {
			username: "Phạm Nhật Vượng",
			avatar: "august.png",
			personal_concept: "We are number #1",
			main_color: "#2155CD",
			user_bio: "This is our Vin Group",
			authorSlug: "pham-nhat-vuong-admin"
		},
		title: "Ngày đêm tối",
		type: "Life",
		content: "Sáng 4/5, Hội nghị Trung ương 5 khóa XIII khai mạc tại Hà Nội. Dự kiến trong 7 ngày, các đại biểu sẽ tập trung thảo luận,",
		image: "darkart.png",
		description: "CAIRO",
		slug: "ngay-dem-toi"
	}
	new Blogs(default_blog).save()
})



/* GET home page. */
router.get('/', (req, res, next) => {
	Blogs.find({})
		.then((blogs) => {

			if (blogs.length == 0) {
				return res.json({ success: false, msg: 'Chưa có blog' });
			}

			var data = blogs.map(blog => {
				return {
					author: blog.author,
					title: blog.title,
					description: blog.description,
					content: blog.content,
					type: blog.type,
					image: blog.image,
					createdAt: normalizeDate(blog.createdAt),
					slug: blog.slug,
					num_likes: blog.likers.length
				}
			})

			var len = data.length;
			var slides = {
				top1: data[len - 1],
				top2: data[len - 2],
				top3: data[len - 3]
			}

			var counter = new Object();
			['Food', 'Travel', 'Life', 'Business', 'Adventure', 'Sport', 'Technology', 'Entertainment'].forEach(c => {
				counter[c] = count(c, data);
			})

			var randomBlogger = data[Math.round(Math.random() * (len - 1))].author;
			var current_user = req.session.user;
			console.log(randomBlogger.authorSlug);
			return res.render('index', {
				layouts: true,
				sidebars: false,
				signed: current_user ? true : false,
				category: true,
				footer: true,
				googleId: (current_user && current_user.googleId) ? current_user.googleId : '',
				slides: slides,
				slug: current_user ? current_user.slug : '',
				status: current_user ? 'Đăng Xuất' : 'Đăng Nhập',
				username: current_user ? current_user.username : 'Người lạ',
				useravatar: current_user ? current_user.avatar : "",
				bloggerName: randomBlogger.username,
				bloggerSlug: randomBlogger.authorSlug,
				avatar: randomBlogger.avatar,
				bloggerBio: randomBlogger.user_bio,
				main_color: current_user ? current_user.main_color : 'black',
				concept: 'World Seed',
				counter,
				data: data.reverse(),
			})
		})
		.catch(next);
});


router.get('/team-dev', (req, res, next) => {
	
	return res.render('team');
})


// collections slug
router.get('/collections/:key', (req, res, next) => {
	Blogs.find({ type: req.params.key })
		.then(blogs => {
			var data = blogs.map(blog => {
				console.log(blog.author.avatar)

				return {
					authorName: blog.author.username,
					title: blog.title,
					image: blog.image,
					avatar: blog.author.avatar,
					createdAt: normalizeDate(blog.createdAt),
					slug: blog.slug,
					num_likes: (blog.likers).length,
				}
			})

			const current_user = req.session.user;

			return res.render('collections', {
				concept: req.params.key,
				hidebox: true,
				layouts: true,
				type: req.params.key,
				username: current_user ? current_user.username : "Người lạ",
				status: current_user ? 'Đăng Xuất' : 'Đăng Nhập',
				main_color: current_user ? current_user.main_color : '#000000',
				googleId: (current_user && current_user.googleId) ? current_user.googleId : '',
				signed: current_user ? true : false,
				slug: current_user ? current_user.slug : '',
				data: data.reverse(),
			})
		})
		.catch(next)
});


module.exports = router;
