var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var cons = require('consolidate')
var session = require('express-session')
var mysql = require('mysql')
var socket = require('socket.io')
var sharedsession = require("express-socket.io-session")
var ExpressPeerServer = require('peer').ExpressPeerServer;
var webRTC = require('webrtc.io').listen(8001);


// mysql
/*var db = mysql.createConnection({
   host: "localhost",
    user: "root",
    password: "",
    database: "nodemysql",
});

db.connect((err) => {
    if (err){
        console.log(err);
    }
    
    var sql = "CREATE DATABASE IF NOT EXISTS nodemysql";
    db.query(sql, (err2, result) => {
        if (err2){
            console.log(err2);
        }
        console.log("database created");
    });
    
    var sql = "CREATE TABLE IF NOT EXISTS gamescore (gamename VARCHAR(255), user VARCHAR(255), score VARCHAR(255))";
    db.query(sql, (err3, result) => {
        if (err3){
            console.log(err3);
        }
        console.log("table created");
    });
    
     
})*/



           
var router = express.Router();
// view engine setup
app.set('view engine', 'pug')
app.set('views', './views')
//

//
var session1 = session({secret: "success",
                 resave: true,
                 saveUninitialized: true});
app.use(session1)
app.use(bodyParser.urlencoded({extended: false}))
app.use('/lobby', router)

// server and socket setup
var server = app.listen(process.env.PORT || 3000)
var io = socket(server)

// peer server
/*var options = {
    debug: true
}
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);
peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));

peerServer.listen(9000);
peerServer.on('connection', function(id) { console.log("peerserver") });*/

// 
var users = [];
io.use(sharedsession(session1))
io.on('connection', (socket) => {
    console.log('made socket connection')
    
    socket.on('chat', (data) =>{
        
        io.sockets.emit('chat', {message: data.message, name: socket.handshake.session.username})
        socket.handshake.session.save();
    })
    
    socket.on('join', () =>{
        users.push(socket.handshake.session.username);
        io.sockets.emit('join', {users_list: users})
    })
    
    socket.on('leave', ()=>{
        for (var i = 0; i < users.length; i++ ){
            if (users[i] == socket.handshake.session.username){
                break;
            }
        }
        users.splice(i, 1);
        io.sockets.emit('join', {users_list: users})
    })
})
//


router.use((req, res, next)=>{
    //console.log("middle")
    if (req.method == "GET" && !req.session.username){
        res.redirect('/')
    } else {
        next()
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/home/index.html'))
})

router.get('/', (req, res) =>{
        res.render('lobby' , {title : 'Game Lobby', username: req.session.username})
})
router.post('/', (req, res) =>{  
    req.session.username = req.body.username;
    res.render('lobby' , {title : 'Game Lobby', username: req.session.username})
})

router.get('/game1_description', (req, res) => {
        res.render('game1_description', {username: req.session.username})  
})

router.get('/game1', (req, res) => {
        res.sendFile(path.join(__dirname +'/html/game1.html')) 
})



