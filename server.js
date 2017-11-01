var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');
var users=[];
var connections = [];


/*
When hosting your application on another service 
(like Heroku, Nodejitsu, and AWS), 
your host may independently configure the process.env.PORT 
variable for you; 
after all, your script runs in their environment.
the defult is 3000
*/
server.listen(process.env.PORT || 3000); 
console.log('Server on...');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	//var stream = fs.createReadStream(__dirname + '/data.txt');
	//stream.pipe(res);
});

//open a connection with socket io, all emits are here - emit- send stuff to client
//.sockets
io.on('connection', function(socket){
	//push socket into array
	connections.push(socket);
	console.log('Something connected: %s', connections.length);
	//log off
	socket.on('disconnect', function(data){
		console.log('Who disconnect: %s', users.splice(users.indexOf(socket.username), 1));
		
		connections.splice(connections.indexOf(socket), 1);
		console.log('%s sockets connected', connections.length);
		io.emit('get users', users);
		logoffusers();
		
	});

	//send messages
	socket.on('send message', function(data){
		console.log(data);

		io.emit('new message',{msg: data, user: socket.username});
		
		setInterval(function(){
			date = new Date();
			HR = date.getHours();
			min = date.getMinutes();
			date = HR+": "+min;
			io.emit('date',{'date' : date}  );
					},1000);
	});

	



	//new user
	socket.on('new users', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
		console.log("%s has joined the chat", socket.username);
	});

	socket.on('disconnect message', function(data, callback){
		logoffusers();
	});

	socket.on('private message', function(from, msg){

	})




	//file transfer
	
	ss(socket).on('file', function(stream,data){
		
		stream.pipe(stream.createWriteStream(stream))
		var filename = path.basename(data.name);
		var stream = ss.createStream();
		fs.createStream(filename).pipe(stream);
		var file = stream;
		console.log(file);
		console.log("send file button clicked");
		console.log("typeof stream: %s ", typeof(stream) + stream);
		console.log("typeof data: %s ", typeof(data) + data);
	});


   function logoffusers(){
   	 console.log(users);
   	 io.emit('disconnect message', users );
   }
	function updateUsernames(){
		console.log(users);
		io.emit('get users', users); 
		io.emit('join message', socket.username);
		console.log(socket.username);
	}



});