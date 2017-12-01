

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');
var dateformat = require('dateformat');


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
		var now = new Date();
		now = dateformat(now, 'mediumTime');
		console.log(now);
		io.emit('new message',{msg: data, user: socket.username, time: now});
		
    });
	//new user to client
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

    socket.on('subscribe',function(room){
    	console.log('room joined ' + room);
    	socket.join(room);
    	socket.broadcast.to(room).emit('private message', socket.username);
    });


	socket.on('upload file', function(message){
		
		var writer = fs.createWriteStream(path.resolve(__dirname, './tmp/' + message.name),{
			encoding: 'base64'
		});
		console.log(writer);
		writer.write(message.data);
		writer.end();

		writer.on('finish',function(){
			socket.broadcast.to('roomId').emit('file uploaded', {
				name: './tmp/' + message.name,
				files: message.data
			});
		});
	});

   socket.on('send private message', function(data){
   	console.log('sending room post', data.room);
   	console.log()
   	var chatters ={};
   	chatters[data] = socket.id;
   	console.log(chatters[0]);
   	socket.broadcast.to(data.room).emit('private stuff', {
   		message: data.message
   	});
   });


 //to clients
   function logoffusers(){
   	 console.log(users);
   	 io.emit('disconnect message', users );
   }
	//to cleints
	function updateUsernames(){
		console.log(users);
		io.emit('get users', users); 
		io.emit('join message', socket.username);
		console.log(socket.username);
	}

});