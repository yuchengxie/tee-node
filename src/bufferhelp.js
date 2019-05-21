function bufToNumer(buf) {
    var t = 0;
    for (var i = 0; i < buf.length; i++) {
      t += parseInt(buf[i], 10) * Math.pow(256, buf.length - i - 1);
    }
    return t;
  }
  
  function numToBuf(num, isHex) {
    isHex == undefined ? false : isHex;
    var s = "";
    if (!isHex) {
      s = num.toString(16);
    }
    if (s.length % 2 != 0) {
      s = "0" + s;
    }
    return new Buffer.from(s, "hex");
  }
  
  function numToBuf(num, isHex, n) {
    isHex == undefined ? false : isHex;
    var s = "";
    if (!isHex) {
      s = num.toString(16);
    }
    if (s.length % 2 != 0) {
      s = "0" + s;
    }
    var b1 = new Buffer(n);
    //   var b2 = new Buffer.from(s, "hex");
    var b2 = new Buffer.from(s, "hex").reverse();
    if (b1.length < b2.length) throw "numToBuf err";
    for (var i = 0; i < b2.length; i++) {
      b1[i] = b2[i];
    }
    return b1;
  }
  
  function toBufEndian(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex);
    if (b1.length < b2.length) throw "toBufEndian err";
    for (var i = 0; i < b1.length; i++) {
      b0[i] = b1[i];
    }
    return b0;
  }
  
  function bufToStr(buf) {
    var s = "";
    buf.forEach(ele => {
      var tmp = ele.toString(16);
      if (tmp.length === 1) {
        s += "0" + tmp;
      } else {
        s += tmp;
      }
    });
    return s;
  }
  
  function hexToBuffer(hex) {
    var typedArray = new Uint8Array(
      hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
      })
    );
    var buffer = typedArray.buffer;
    buffer = Buffer.from(buffer);
    return buffer;
  }
  
  function strToBuffer(str, n) {
    var b1 = new Buffer(n);
    var b2 = new Buffer(str);
    if (b1.length < b2.length) throw "strToBuffer err";
    for (var i = 0; i < b2.length; i++) {
      b1[i] = b2[i];
    }
    return b1;
  }
  
  // function uock
  
  // function hexStrToBuffer(hex) {
  //     if (hex.length % 2 != 0) {
  //         hex = '0' + hex;
  //     }
  //     var size=hex.length/2;
  //     var buf=new Buffer(hex);
  //     return buf;
  // }
  
  function hexStrToBuffer(hex) {
    if (hex == "") return new Buffer("");
    if (hex.length % 2 != 0) {
      hex = "0" + hex;
    }
    var typedArray = new Uint8Array(
      hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
      })
    );
    var buffer = typedArray.buffer;
    buffer = Buffer.from(buffer);
    return buffer;
  }
  
  module.exports = {
    bufToNumer,
    numToBuf,
    toBufEndian,
    bufToStr,
    hexToBuffer,
    strToBuffer,
    hexStrToBuffer
  };
  