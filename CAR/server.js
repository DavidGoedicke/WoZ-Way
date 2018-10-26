/*
server.js - CAR

Author: Niklas Martelaro (nmartelaro@gmail.com)

Purpose: This is the server for the WoZ Way in car system. It can send messages
back to the control interface as well as recieve messages from the control
interface. Theis messageing is handled using and MQTT server in a known
location.

The server subscribes to MQTT messages from the control interfcae and publishes
MQTT messages that will the control interface will listen to.

Usage: node server.js

Notes: You will need to specify what MQTT server you would like to use.
*/

//****************************** SETUP ***************************************//
// MQTT Setup
var mqtt   = require('mqtt');
var client = mqtt.connect('mqtt://127.0.01',
                           {port: 8134,
                            protocolId: 'MQIsdp',
                            protocolVersion: 3 });
// Text to speech setup
var say = require('say');
var lastState='n'
var speaking =false;
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

if(!process.argv[2]) {
    console.error('Usage: node '+process.argv[1]+' SERIAL_PORT');
    process.exit(1);
}

// initialize the serial port based on the user input
const port = new SerialPort(process.argv[2])

function sanePortWrite(input){
    if(lastState!=input){
      console.log(input);
        port.write(input);
        lastState=input;
      }
}


//****************************************************************************//



//********************** MQTT MESSAGES WITH ACTIONS **************************//
// Setup the socket connection and listen for messages
client.on('connect', function () {
  client.subscribe('say'); // messages from the wizard interface to speak out
  client.subscribe('anim');
  console.log("Waiting for messages...");

  // messages for testing
  client.publish('say', 'Alright I am up!');
});

// Print out the messages and say messages that are topic: "say"
// NOTE: These voices only work on macOS
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(topic, message.toString());

  // Say the message using Apple's Text to speech
  if (topic === 'say') {
    // use default voice in System Preferences - You can sent this yourself
    console.log('');
    sanePortWrite('a');
    speaking=true;
    say.speak(null, message.toString(),(err)=>{
      sanePortWrite('i');
      speaking=false;
      if (err) {
          return console.error(err)
      }
    });
  }
  if (topic === 'anim') {
    // use default voice in System Preferences - You can sent this yourself
    //console.log('');
    var out = message.toString().split(",");
    if(!speaking){
    if(out[1]==="C"){
      sanePortWrite('t');
    }else if(out[0]==="A"){
      sanePortWrite('l');
    }
    else{
      sanePortWrite('i');
    }
  }

  }

  //client.end();
});
//****************************************************************************//

//********************** SIMULATED CAN DATA MESSAGES *************************//
//setInterval(function(){
    //update with some random data every 200 ms
  //  client.publish('can', '{"name":"vss", "value":' +
  //    Math.floor(Math.random() * 90) +
  //    '}')
  //  client.publish('can', '{"name":"rpm", "value":' +
  //    Math.floor(Math.random() * 6000) +
  //    '}')
//},// 200);
//****************************************************************************//
