var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var mysql = require('mysql')
var socket = require('socket.io')
var sharedsession = require("express-socket.io-session")


//const Firestore = require('@google-cloud/firestore');


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


// for loading
app.use(express.static(path.join(__dirname, '/public')));


           
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

// chat
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
    if (req.method == "GET" && !req.session.username){
        res.redirect('/')
    } else {
        next()
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , '/html/home/index.html'))
})

app.get('/forum', (req, res) =>{
    
    res.sendFile(path.join(__dirname , '/html/forum.html'))
    
})

app.post('/forum', (req, res) =>{
    console.log(req.body);
    res.sendFile(path.join(__dirname , '/html/forum.html'))
})

router.get('/', (req, res) =>{
        res.render('lobby' , {title : 'Game Lobby', username: req.session.username})
})
router.post('/', (req, res) =>{  
    
    req.session.username = req.body.username;
    res.render('lobby' , {title : 'Game Lobby', username: req.session.username})
})

router.get('/just_click_description', (req, res) => {
        res.render('just_click_description', {username: req.session.username})  
})

router.get('/just_click', (req, res) => {
        res.sendFile(path.join(__dirname ,'/html/just_click.html')) 
})

router.get('/XAXB_description', (req, res) => {
        res.render('XAXB_description', {username: req.session.username})  
})

router.get('/XAXB', (req, res) => {
        res.sendFile(path.join(__dirname ,'/html/XAXB.html')) 
})

router.get('/flappy_square_description', (req, res) => {
        res.render('flappy_square_description', {username: req.session.username})  
})

router.get('/flappy_square', (req, res) => {
        res.sendFile(path.join(__dirname ,'/html/flappy_square/flappy_square.html')) 
})





