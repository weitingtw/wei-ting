var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/myapp'});

server.on('connection', function(id) { console.log("peerserver") })