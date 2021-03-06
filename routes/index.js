var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var User = require('../models/user.js');
var Post=require('../models/post.js');

router.post('/post', checkLogin);
router.post('/post', function (req, res) {
  var currentUser = req.session.user,
    post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'Post Successfully!');
    res.redirect('/');//发表成功跳转到主页
  });
});


router.get('/', function (req, res) {
  Post.get(null,function(err,posts){
    if (err) {
      posts=[];
    }
    res.render('index', { 
    title: 'Main Page',
    user: req.session.user,
    posts:posts,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
    });
  });
});

router.get('/reg',checkNotLogin);
router.get('/reg', function (req, res) {
  res.render('reg', { 
    title: 'regist',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/reg',checkNotLogin);
router.post('/reg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  //检验用户两次输入的密码是否一致
  if (password_re != password) {
    req.flash('error', 'two password is not same'); 
    return res.redirect('/reg');//返回注册页
  }
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
  });
  //检查用户名是否已经存在 
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', 'user exist!');
      return res.redirect('/reg');//返回注册页
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');//注册失败返回主册页
      }
      req.session.user = newUser;//用户信息存入 session
      req.flash('success', 'regist successfully!');
      res.redirect('/');//注册成功后返回主页
    });
  });
});
router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: 'login',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash('error', 'user not exist!');
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', 'wrong password!');
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', 'login successfully!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});

router.get('/post', checkLogin);
router.get('/post', function (req, res) {
  res.render('post', {
    title: 'post',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post',checkLogin);
router.post('/post', function (req, res) {
});

router.get('/logout',checkLogin);
router.get('/logout', function (req, res) {
  req.session.user = null;
  req.flash('success', 'logout successfully!');
  res.redirect('/');//登出成功后跳转到主页
});

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'not login!'); 
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'logined!'); 
    res.redirect('back');//返回之前的页面
  }
  next();
}


module.exports = router;
