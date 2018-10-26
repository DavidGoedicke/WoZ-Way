/*
server.js - CONTOL INTERFACE

Author: Niklas Martelaro (nmartelaro@gmail.com)

Purpose: This is the server for the WoZ Way wizard station. The server acts as
the webserver for the control interface (which is an HTML page). The server also
manages MQTT messaging to and from the car. This is needed becasue there is not
a direct link from the web front-end to MQTT.

The server subscribes to MQTT messages from the car and publishes MQTT messages
that will the car will listen to.

Usage: node server.js

Notes: You will need to specify what MQTT server you would like to use.
-------
Adapted by David Goedicke

PricicollID
makingAssistant
*/


//****************************** SETUP ***************************************//
// Webserver for the cont rol interface front end
var express = require('express'); // web server application
var http = require('http');				// http basics
var app = express();							// instantiate express server
var server = http.Server(app);		// connects http library to server
var io = require('socket.io')(server);	// connect websocket library to server
var serverPort = 8000;

// MQTT messaging - specify the server you would like to use here
var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.0.1',
                           {port: 8134,
                            protocolId: 'MQIsdp',
                            protocolVersion: 3 });

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
//****************************************************************************//


//****************************** WEB INTERFACE *******************************//
// use express to create the simple webapp
app.use(express.static('public'));		// find pages in public directory

if(!process.argv[2]) {
    console.error('Usage: node '+process.argv[1]+' SERIAL_PORT');
    process.exit(1);
}

// initialize the serial port based on the user input
const port = new SerialPort(process.argv[2])

// create a parser so that we can easily handle the incoming data by reading the line
const parser = port.pipe(new Readline({
    delimiter: '\r\n'
}))

// start the server and say what port it is on
server.listen(serverPort, function() {
    console.log('listening on *:%s', serverPort);
});
//****************************************************************************//


//********************** MQTT MESSAGES FROM CAR ******************************//
// Setup the MQTT connection and listen for messages
client.on('connect', function () {
  //Subscribe to topics
  client.subscribe('can'); // CAN data
  client.subscribe('say'); // Messages to say
  console.log("Waiting for messages...");
  client.publish('say', 'Hello, I am a making Assistant');
});

// process the MQTT messages
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message.toString());

  switch (topic) {
    case 'can':
      io.emit('can-msg', message.toString());
      break;
    default:
      io.emit('server-msg', message.toString());
  }
  //client.end();
});
//****************************************************************************//


//*************** WEBSOCKET MESSAGES FROM CONTROL INTERFACE ******************//
// This is the websocket event handler. WebSockets are used to communicate
// between this server and the webapp front end wizard interface.
// As long as someone is connected, listen for messages from the wizard
// interface.
io.on('connect', function(socket) {
    console.log('a user connected');

    // if you get a message to send, send to the MQTT broker
    socket.on('say', function(msg) {
        console.log(msg);
        //send it to the mqtt broker
        client.publish('say', msg);
    });

    // if you get the 'disconnect' message, say the user disconnected
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});
//****************************************************************************//

//****************************v SERIAL PORT **********************************//
parser.on('data', function(data) {
    console.log('data:', data);
    client.publish('anim', data);
})
//****************************************************************************//
