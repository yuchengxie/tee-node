// var dgram = require("dgram");
// var socket = dgram.createSocket("udp4");
// socket.bind(function () {
//   socket.setBroadcast(true);
// });

// var message = new Buffer("Hi");
// socket.send(message, 0, message.length, 41234, '255.255.255.255', function(err, bytes) {
//   socket.close();
// });

//基本与服务端类似
const dgram = require('dgram');
const dns = require('dns');
var mine_hostname = 'user1-node.nb-chain.net';
var mine_port = 30302;
var bh = require('./bufferhelp');
var client = dgram.createSocket('udp4');

dns.lookup(mine_hostname, (err, addr, family) => {
    var buf = bh.hexStrToBuffer('f96e6274706f65747461736b000000000c000000ee9b92e3000000000000000000000000');
    client.send(buf, 0, buf.length, mine_port, addr, function (err, bytes) {
        if (err) {
            console.log('send err');
        } else {
            console.log('send:%d字节', bytes);
        }
    });

    client.on('message', function (msg, rinfo) {
        console.log('rev', msg,rinfo);
    })
})

