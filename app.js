// 'use strict';
// // // dependencies
//  //var express = require('express');
//  //var https = require('http');
// // var path = require('path');
// // var request = require('request');
// // var app = express();

// // // all environments
// // app.set('port', 3000);
// // app.set('views', __dirname + '/views');
// // app.set('view engine', 'jade');
// // app.use(express.favicon());
// // app.use(express.logger('dev'));
// // app.use(express.bodyParser());
// // app.use(express.methodOverride());
// // app.use(app.router);
// // app.use(express.static(path.join(__dirname, 'public')));

// // // development only
// // if ('development' == app.get('env')) {
// //   app.use(express.errorHandler());
// // }

// // // first route
// // app.get('/', function(req, res) {res.render('index')});


// // https.createServer(app).listen(app.get('port'), function(){
// //   console.log('Express server listening on port ' + app.get('port'));
// // });




// var os = require('os');
// var nodeStatic = require('node-static');
// var http = require('http');

// var express = require("express");

// var router = express.Router();


// var fileServer = new(nodeStatic.Server)();
// var app = http.createServer(function(req, res) {
//   fileServer.serve(req, res);
//   console.log("Your server is running on 8081 port.....")
// }).listen(8081);

// console.log("app",app)

// app.use(express.static('public'))
// // // first route
//  //app.use(app.router);
//  //app.router.get('/', function(req, res) {res.render('index')});
//  //app.router.get('/about',function(req,res){res.render('about')});
//  //app.router.get('/contact',function(req,res){res.render('contact')})
// // app.set('port', 3000);
// // app.set('views', __dirname + '/views');
// // app.set('view engine', 'jade');
// // app.use(express.favicon());
// // app.use(express.logger('dev'));
// // app.use(express.bodyParser());
// // app.use(express.methodOverride());

// // app.use(express.static(path.join(__dirname, 'public')));

// // // development only
// // if ('development' == app.get('env')) {
// //   app.use(express.errorHandler());
// // }

// // // first route
// // app.get('/', function(req, res) {res.render('index')});



var express = require('express');
var path = require('path');
var app = express();
 var socketIO = require('socket.io');
 var nodemailer = require('nodemailer');
// // app.set('views', __dirname + './views');
//  //app.use(express.static(path.join(__dirname, 'public')));
//  app.set('views', __dirname + 'Views');
//  app.set('view engine', 'ejs');


// Require static assets from public folder
//app.use(express.static(path.join(__dirname, '/public')));

// Set 'views' directory for any views 
// being rendered res.render()

app.use("/public", express.static(__dirname + '/public'));

app.use("/stylesheets", express.static(__dirname + '/stylesheets'));
app.set('views', path.join(__dirname , 'Views'));

// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

let server = require('http').Server(app);

server.listen(process.env.PORT || 8080, function(){
  console.log("Express server listening on port ",process.env.PORT);
});

app.get('/', function(req, res){
  res.render('index')
});
app.get('/contact', function(req, res){
  res.render('contact')
});
app.get('/about', function(req, res){
  res.render('about')
});

app.get('/blogs', function(req, res){
  res.render('blogs')
});
app.get('/sendEmail',function (req,res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mailpayalverma@gmail.com',
      pass: 'Payal20031986'
    }
  });
  
  var mailOptions = {
    from: req.query.email,
    to: 'mailpayalverma@gmail.com',
    subject: 'Message from Payal Verma info page from ' + req.query.name,
    text: req.query.message
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('index')

})


//var server = app.listen(8080);


var io = socketIO.listen(server);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

});