var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var userRouter = require('./routes/userRouter');
var adminRouter = require('./routes/adminRouter');
const connectDB=require("./config/database")
const dotenv=require('dotenv');
const multer=require('multer')
const nocache=require('nocache')
var app = express();
const session = require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

dotenv.config();
connectDB();

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));


const storage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
}
});


app.use(multer({
  dest: 'uploads',
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB
}).array('productimage',4));



const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
    cb(new Error('Only jpeg and png files are allowed'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: fileFilter
}).single('productimage');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(nocache())

app.use(
  session({
    secret:"key",
    cookie:{maxAge:600000},
    saveUninitialized:false,
    resave:false,

  })
); 



app.use('/', userRouter);
app.use('/admin', adminRouter);





app.use((req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    next();
  });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler


app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(404).render("404");
  } else {
    res.status(err.status || 500);
    res.render("error", { error: err });
  }
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// set locals, middlewares for user section
app.use(function (req, res, next) {
  res.locals.user = req.session.userid || null;
  next();
});

module.exports = app;
