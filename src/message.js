const gFormat = require('./format')
const sha256 = require('js-sha256');
const bufferhelp = require('./bufferhelp');
// const types = require('./types');

const magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);

function bindMsg(prot) {
    function Msg() {
        this.parse = global_parse_func;
        this.binary = global_binary_func;
    }
    Msg.prototype = prot;
    var obj = new Msg();
    return obj;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}

function global_binary_func(msg, buf, prot, arrayLen) {

    if (prot == undefined) {
        prot = this.__proto__;
    }

    if (typeof arrayLen == 'number') {
        if (prot.getFmt != undefined) {
            fmt = prot.getFmt();
            for (var i = 0; i < arrayLen; i++) {
                var m = msg[i];
                for (var j = 0; j < fmt.length; j++) {
                    fmt2 = fmt[j];
                    var attrName = fmt2[0];
                    var attrType = fmt2[1];
                    var v = m[attrName];
                    var ret = global_binary_func(v, buf, attrType);
                    buf = Buffer.concat([buf, ret]);
                }
            }
            return buf;
        } else {
            fmt = prot;
            for (var i = 0; i < arrayLen; i++) {
                var m = msg[i];
                var fmt2 = fmt.split('[')[0];
                var ret = global_binary_func(m, buf, fmt2);
                buf = Buffer.concat([buf, ret]);
            }
            return buf;
        }


    }

    var fmt;
    if (typeof (prot) == 'string') {
        fmt = prot;
    } else {
        if (prot.getFmt == undefined) {
            fmt = gFormat['S'];
        } else {
            fmt = prot.getFmt();
        }
    }

    if (typeof (fmt) == 'string') {
        if (fmt[fmt.length - 1] == ']') {
            if (fmt[fmt.length - 2] == '[' && typeof (arrayLen) == 'string') {//var length arr/str
                var ft = fmt.slice(0, fmt.length - 2);
                //str
                if (arrayLen.split('_')[0].includes('str')) {
                    var ret = global_binary_func(msg, buf, 'V')//ret value map buf
                    buf = Buffer.concat([buf, ret]);
                    if (ft == 'VS') {// var-len-str
                        // ret = global_binary_func(msg, buf, 'S');
                        // buf = Buffer.concat([buf, ret]);
                        return global_binary_func(msg, buf, 'S');
                    }
                    //arr
                } else if (arrayLen.split('_')[0].includes('arr')) {
                    var v = arrayLen.split('_')[1];
                    return global_binary_func(v, buf, 'V');
                }
            } else { //fixed length arr/str
                var b = fmt.split('[');
                if (b[0] == 'VS') { //str
                    var len = msg.length;
                    //str - length
                    var retv = global_binary_func(len, buf, 'V');
                    //str - content
                    var rets = global_binary_func(msg, buf, 'S')
                    return Buffer.concat([retv, rets]);
                } else { //arr

                }
            }
        } else {
            //standard
            if (fmt == 'I') {
                return toBufEndian(msg, false, 4);
            }
            if (fmt == 'V') {
                // var len = msg.length;
                return toBufEndian(msg, false, 1);
            }
            if (fmt == 'S') {
                return new Buffer(msg);
            }
            if (fmt == 'q') {
                return toBufLE(msg, false, 8);
            }
            if (fmt == 'H') {
                return toBufEndian(msg, false, 2);
            }
        }
    } else if (isArray(fmt)) {
        var subObj = new bindMsg(prot);
        for (var i = 0, item; item = fmt[i]; i++) {
            var attrName = item[0], attrType = item[1];
            var v = msg[attrName];
            // if (attrName == 'tx_in') {
            //     var a = 1;
            // }
            // if (isArray(v)) {
            //     //需要接收的return
            //     var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'arr_' + v.length]);//返回[buf];
            //     buf = Buffer.concat([buf, ret]);
            // } else if (typeof v == 'string') {
            //     var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'str_' + v.length]);//返回[buf];
            //     buf = Buffer.concat([buf, ret]);
            // } else {
            //     var ret = global_binary_func.apply(subObj, [v, buf, attrType]);//返回[buf];
            //     buf = Buffer.concat([buf, ret]);
            // }


            if (isArray(v)) {
                var subObj = new bindMsg(prot);
                var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'arr_' + v.length]);//返回[buf];
                buf = Buffer.concat([buf, ret]);
                var fmt2 = gFormat[attrName];
                if (fmt2 == undefined) {
                    buf = global_binary_func.apply(subObj, [v, buf, attrType, v.length]);
                } else {
                    buf = global_binary_func.apply(subObj, [v, buf, fmt2, v.length]);
                }

            } else {
                // v = msg[attrName];
                if (typeof (v) == 'string') {
                    var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'str_' + v.length]);//返回[buf];
                    buf = ret;
                } else {
                    var ret = global_binary_func.apply(subObj, [v, buf, attrType]);//返回[buf];
                    buf = Buffer.concat([buf, ret]);
                }
            }
        }
    }
    return buf;
}

function global_parse_func(buf, offset, prot, arrayLen) {//return [offset,value]

    if (prot == undefined) {
        prot = this.__proto__;
    }

    if (typeof arrayLen == 'number') {
        var bRet = [];
        for (var i = 0; i < arrayLen; i++) {
            var tmp = global_parse_func(buf, offset, prot);
            offset = tmp[0];
            bRet.push(tmp[1]);
        }
        return [offset, bRet];
    }

    var fmt;

    if (typeof (prot) === 'string') {
        fmt = prot;
    } else {
        if (prot.getFmt == undefined) {
            fmt = gFormat['S'];//specical
        } else { // array
            fmt = prot.getFmt();
        }
    }

    // if fmt is string or prot is array
    if (typeof (fmt) === 'string') {
        if (fmt[fmt.length - 1] == ']') {
            if (fmt[fmt.length - 2] == '[') {// 'fmt_name[]' means var-len-array
                var ft = fmt.slice(0, fmt.length - 2);

                var fmt2 = gFormat[fmt.slice(0, fmt.length - 2)];

                if (fmt2 == null) {
                    fmt2 = fmt.slice(0, fmt.length - 2)
                }
                var ret = global_parse_func(buf, offset, 'V');// ret = [new_offset,result]
                var subArrayLen = ret[1];
                offset = ret[0];

                if (ft.includes('List')) {
                    var ret = global_parse_func(buf, offset, 'V');// ret = [new_offset,result]
                    var subArrayLen = ret[1];
                    offset = ret[0];
                }

                if (ft == 'VS') {// var-len-str
                    return global_parse_func(buf, offset, 'S', 'strlen_' + subArrayLen);
                } else if (ft == 'VInt') {// var-len-int
                    return global_parse_func(buf, offset, 'Int', 'intlen_' + subArrayLen);
                } else {
                    return global_parse_func(buf, offset, fmt2, subArrayLen);
                }
            }
            else {// 'fmt_name[n]' means fix length array
                var b = fmt.split('[');
                if (b[0] == 'S') {// fix length str
                    var strlen = parseInt(b[1].split(']')[0]);
                    return global_parse_func(buf, offset, 'S', 'strlen_' + strlen);
                } else if (b[0] == 'B') {
                    var bytelen = parseInt(b[1].split(']')[0]);
                    return global_parse_func(buf, offset, 'B', 'bytelen_' + bytelen);
                } else {
                    var subArrayLen = parseInt(b[1].split(']')[0]);
                    var fmt2 = gFormat[b[0]];
                    return global_parse_func(buf, offset, fmt2, subArrayLen);
                }
            }
        }
        else {
            return standard(buf, fmt, offset, arrayLen);
        }
    } else if (isArray(fmt)) {
        var subObj = new bindMsg(prot);
        for (var i = 0, item; item = fmt[i]; i++) {
            var attrName = item[0], attrType = item[1];
            if (attrName == 'found') {
                var a = 1;
            }
            var ret = global_parse_func.apply(subObj, [buf, offset, attrType]);
            offset = ret[0];
            subObj[attrName] = ret[1];
        }
        return [offset, subObj];
    }
}

function standard(buf, fmt, offset, arrayLen) {//standard format
    if (fmt == 'V') {
        return [offset + 1, bufToNumer(buf.slice(offset, offset + 1))];
    }
    if (fmt == 'I') {
        return [offset + 4, bufToNumer(buf.slice(offset, offset + 4).reverse())];
    }
    if (fmt == 'uq') {
        return [offset + 8, buf.slice(offset, offset + 8).reverse()];
    }
    if (fmt == 'q') {
        return [offset + 8, bufToNumer(buf.slice(offset, offset + 8).reverse())];
        // return [offset+8,buf.slice(offset,offset+8).reverse()];
    }
    if (fmt == 'S') {   //fixed-len-str
        var len = parseInt(arrayLen.split('_')[1]);
        return [offset + len, bufferhelp.bufToStr(buf.slice(offset, offset + len))];
    }
    if (fmt == 'B') {   //fixed-byte-length
        var len = parseInt(arrayLen.split('_')[1]);
        return [offset + len, bufferhelp.bufToStr(buf.slice(offset, offset + len))];
    }
    if (fmt == 'Int') {   //fixed-integer-length
        var value = parseInt(arrayLen.split('_')[1]);
        if (value < 0xFD) //todo expand more
            return [offset, value];

    }
}

function bufToNumer(buf) {
    var t = 0;
    for (var i = 0; i < buf.length; i++) {
        t += parseInt(buf[i], 10) * Math.pow(256, buf.length - i - 1);
    }
    return t;
}
function numToBuf(num, isHex) {
    isHex == undefined ? false : isHex;
    var s = '';
    if (!isHex) {
        s = num.toString(16);
    }
    if ((s.length) % 2 != 0) {
        s = '0' + s;
    }
    // return new Buffer.from(s, 'hex');
    return new Buffer.from(s, 'hex');
}

function toBufLE(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex).reverse();
    if (b1.length > len) throw 'toBufLE out of range';
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}

function toBuf(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex);
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}

function toBufEndian(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex);
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}

function toBuffer(hex) {
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    buffer = Buffer.from(buffer);
    return buffer;
}

function strip(buf) {
    var arr = [];
    for (var i = 0; i < buf.length; i++) {
        arr.push(buf[i]);
    }
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == 0x00) {
            arr.splice(i, 1);
        } else {
            break;
        }
    }
    return Buffer.from(arr);
}

function g_parse(data) {
    if (data.slice(0, 4).equals(magic) != 1) {
        throw Error('bad magic number');
    }
    var buf = data.slice(16, 20);
    var value = bufToNumer(buf);
    var buf = Buffer.allocUnsafe(4);
    buf.writeUInt32LE(value, 0);
    var v2 = bufToNumer(buf);
    var payload = data.slice(24, 24 + v2);
    //check the checksum
    var checksum = toBuffer(sha256(toBuffer(sha256(payload)))).slice(0, 4);
    if (data.slice(20, 24).compare(checksum) != 0) {
        // throw Error('bad checksum');
        // console.log('bad checksum');
        return;
    }
    var command = data.slice(4, 16);
    var stripCommand = strip(command);
    var msg_type = stripCommand.toString('latin1');
    this.command = msg_type;
    // console.log('> msg_type:', msg_type, msg_type.length);
    return payload;
}

function g_binary(payload, command) {
    //4-16
    var b_command = bufferhelp.strToBuffer(command, 12);
    //16-20 payload len
    var len_command = bufferhelp.numToBuf(payload.length, false, 4);
    //20-24
    var checksum = toBuffer(sha256(toBuffer(sha256(payload)))).slice(0, 4);

    var b = Buffer.concat([magic, b_command, len_command, checksum, payload]);

    return b;
}




function parseBlock(payload) {
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.block);
    return msg.parse(payload, 0);
}

function parseInfo(payload) {
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.info);
    return msg.parse(payload, 0);
}

function parseUtxo(payload) {
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.utxo);
    return msg.parse(payload, 0);
}


module.exports = {
    bindMsg, g_parse, parseInfo, parseUtxo, parseBlock, g_binary
}