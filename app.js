var createError = require('http-errors');
var express = require('express');
var path = require('path');

var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var blogsRouter = require('./routes/blogs');

var app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./libs/key');
const db = require('./config/db');
var Users = require('./models/Users');
const { send } = require('process');
db.connect()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("cookie-parser")("abc"));
app.use(require("express-session")());
app.use(passport.initialize());
app.use(passport.session());

// để xài những file ảnh có sãn
app.use('*/images',express.static(path.join(__dirname, 'public/images')));
app.use('*/js',express.static(path.join(__dirname, 'public/js')));
app.use('*/css',express.static(path.join(__dirname, 'public/css')));
app.use('/fonts',express.static(path.join(__dirname, 'public/fonts')));

// để upload file hình ảnh từ user lên
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/', (req, res) => {
//   return res.json(path.join(__dirname, 'public/fonts'));
// })

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blogs', blogsRouter);



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(
  new GoogleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await Users.findOne({googleId: profile.id});
      // console.log(profile);
      if (existingUser) {
        return done(null, existingUser);
      }

      console.log(profile);
      const user = await new Users({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        main_color: '#000000',
        avatar: "logo.png",
        slug: profile.displayName.toLowerCase().replace(' ','-'),
      }).save();

      done(null, user);
    })
);

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get('/auth/google/callback', passport.authenticate('google'), (req, res, next) => {
  if(req.user) {
    req.session.user = req.user;
    req.session.slug = req.user.slug;
    return res.redirect('/');
  }

  return send('404 Not Found');
}); 




app.get('/api/current_user', (req, res) => {
  res.send(req.user);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
