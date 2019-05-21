
const bitcoinjs = require('bitcoinjs-lib');
const sha512 = require('js-sha512');
const sha256 = require('js-sha256');
const bs58 = require('bs58');
const ripemd160 = require('ripemd160');
const bh = require('./bufferhelp');



function compress_public_key(public_key) {
    var buf_pub_key = bh.hexToBuffer(public_key);
    if (buf_pub_key[0] != 4 || buf_pub_key.length != 65) {
        console.log('invalid uncompressed public key')
        return '';
    }
    var s = bh.bufToNumer(buf_pub_key.slice(buf_pub_key.length - 1));
    var a = s & 0x01;
    var b = 0x02 + a;
    var c = bh.numToBuf(b, false, 1);
    var d = Buffer.concat([c, buf_pub_key.slice(1, 33)]);
    // return bh.bufToStr(d);
    return d;
}

function publickey_to_address(publickey, vcn, cointype = 0x00, version = 0x00) {
    var pubHash;
    if (vcn == undefined) {
        pubHash = bitcoinjs.crypto.ripemd160(publickey);
        var s = version + pubHash;
        var m = bs58.encode(s);
        return m;
    } else {
        var hashbuf = sha512.array(publickey);
        var s1 = new ripemd160().update(Buffer.from(hashbuf.slice(0, 32), 'hex')).digest();
        var s2 = new ripemd160().update(Buffer.from(hashbuf.slice(32, 64), 'hex')).digest();
        // var s1= bitcoinjs.crypto.ripemd160(Buffer.from(hashbuf.slice(0,32),'hex'));
        // var s2= bitcoinjs.crypto.ripemd160(Buffer.from(hashbuf.slice(32,64),'hex'));
        var hi = (vcn & 0xffff) / 256;
        var lo = (vcn & 0xffff) % 256;
        var buf0 = bh.hexToBuffer(sha256(Buffer.concat([s1, s2])));

        var v = Buffer.concat([Buffer.from([version]), Buffer.from([hi, lo]), buf0, Buffer.from([cointype])]);

        var d1buf = bh.hexToBuffer(sha256(v));
        var checksum = bh.hexToBuffer(sha256(d1buf)).slice(0, 4);
        var result = Buffer.concat([v, checksum]);
        var addr = bs58.encode(result);
        return addr;
    }
}

module.exports = {
    publickey_to_address, compress_public_key
}