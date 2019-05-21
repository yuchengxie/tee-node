function pack(str, args) {
    if (str.length <= 1) { throw 'pack data invalid' };
    if (str.length - 1 != args.length) { throw 'pack data invalid' };
    var t_b = new Buffer(0);
    if (str[0] == '<') {
        args.forEach((item, index) => {
            var r = str[index + 1]
            var b;
            if (r == 'I') {
                b = new Buffer(4);
                b.writeUIntLE(item, 0, 4);
                t_b = Buffer.concat([t_b, b]);
            }
            if (r == 'B') {
                b = new Buffer(1);
                b.writeUIntLE(item, 0, 1);
                t_b = Buffer.concat([t_b, b]);
            }
            if (r == 'H') {
                b = new Buffer(2);
                b.writeUIntLE(item, 0, 2);
                t_b = Buffer.concat([t_b, b]);
            }
        });
    } else {
        //todo big endian
    }
    return t_b;
}

module.exports = {
    pack
}
