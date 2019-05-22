
// // // const dns=require('dns');

// // // dns.lookup('user1-node.nb-chain.net',(err,address,family)=>{
// // //     console.log('address:',address);
// // // })

// // // const dgram = require('dgram');
// // // const client = dgram.createSocket('udp4');
// // // console.log('client:',client);




// // // function sleep(sleepTime) {
// // //     for (var start = +new Date; +new Date - start <= sleepTime;) { }
// // // }

// // // function doother() {
// // //     while (true) {

// // //     }
// // // }


// // // function sleep(delay) {
// // //     var startTime = new Date().getTime();
// // //     while (new Date().getTime() < startTime + delay) {
// // //         //堵塞
// // //     }
// // // }

// // // a = 1;
// // // console.log(a);
// // // sleep(5000)
// // // console.log(a);

// // // const gFormat = require('./format');
// // // const message = require('./message');
// // // const bindMsg = message.bindMsg;
// // // const bh=require('./bufferhelp');
// // // function GetPoetTask(link_no, curr_id, timestamp) {
// // //     this.link_no = link_no;
// // //     this.curr_id = curr_id;
// // //     this.timestamp = timestamp;
// // // }

// // // function test_binary() {
// // //     var getPoetTask = new GetPoetTask(0, 0, 0);
// // //     // var bind_msg = new bindMsg(gFormat.poettask);
// // //     // bindMsg.binary(msg);

// // //     var buf = new Buffer(0);
// // //     var msg = new bindMsg(gFormat.poettask);
// // //     var b = msg.binary(getPoetTask, buf);
// // //     var command = 'poettask';
// // //     console.log(b);
// // //     var buf=message.g_binary(b, command);
// // //     console.log(buf,buf.length,bh.bufToStr(buf));

// // //     //poettask

// // //     // msg = new bindMsg(gFormat.info);
// // //     // var b = msg.parse(payload, 0);
// // // }

// // // test_binary();


// // // PoetClient.prototype.send_message = function (msg, peer_addr) {
// // //     //msg->binary
// // //     var bind_msg = new bindMsg(gFormat.poettask);

// // //     // var b = bind_msg.parse(testBuf, 0);
// // //     // console.log(b);
// // //     this.socket.send(msg);
// // // }

// // // //基本与服务端类似
// // // const dgram = require('dgram');
// // // const client = dgram.createSocket('udp4');
// // // const multicastAddr = '54.223.32.193';

// // // client.on('close',()=>{
// // //     console.log('socket已关闭');
// // // });

// // // client.on('error',(err)=>{
// // //     console.log(err);
// // // });
// // // client.on('listening',()=>{
// // //     console.log('socket正在监听中...');
// // //     // client.addMembership(multicastAddr);
// // // });
// // // client.on('message',(msg,rinfo)=>{
// // //     console.log(`receive message from ${rinfo.address}:${rinfo.port}：${msg}`);
// // // });
// // // client.bind('30321',multicastAddr);

// // var dgram = require("dgram");
// // var socket = dgram.createSocket("udp4");
// // socket.bind(function () {
// //   socket.setBroadcast(true);
// // });

// // var message = new Buffer("Hi");
// // socket.send(message, 0, message.length, 30321, '54.223.32.193', function(err, bytes) {
// // //   socket.close();
// // });
// // socket.on('message',(a,b)=>{
// //     console.log('a:',a);
// // })

// function Test() {
//   this.num = 100;

//   this.func = function () {
//     console.log('n1:', this.num); // 100
//     console.log('this1:', this);
//     // setTimeout(function () {
//     //   console.log('this2:',this);
//     //   console.log('n2:', this.num); // undefined
//     // }, 500);
//     setTimeout(() => {
//       console.log('this2:', this);
//       console.log('n2:', this.num); // undefined
//     }, 500);
//   };
// }
// var obj = new Test();
// obj.func();

// 6d6973736564
// var bh=require('./bufferhelp');
// var b=bh.hexStrToBuffer('6d6973736564');
// var s=b.toString('latin1');
// var a=1;

// var a = [1, 3, 5];
// var b, c, d = a;
// console.log(b);
// console.log(c);
// console.log(d);

// function Stu(name,age){
//     this.name=name;
//     this.age=age;
// }

// var s=new Stu('xyc',18);

// console.log('>>> a:%d\n>>> stu:%o',1,s);
const bh=require('./bufferhelp');
var s='00'
var t=bh.hexStrToBuffer(s);

console.log(t);