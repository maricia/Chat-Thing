var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users=[];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server on...');

app.get('/', function(req, resp){
	resp.sendFile(__dirname + '/index.html');
});

//open a connection with socket io, all emits are here - emit- send stuff to server
io.sockets.on('connection', function(socket){
	//push socket into array
	connections.push(socket);
	console.log('logged on: %s', connections.length);

	//log off
	socket.on('disconnect', function(data){
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('disconnect from sever: %s connected', connections.length);
	});

	//send messages
	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message',{msg: data, user: socket.username});
	});

	//new user
	socket.on('new users', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	//file transfer
	socket.on('send file', function(data, callback){

	})



	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});