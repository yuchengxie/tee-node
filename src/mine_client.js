const dgram = require('dgram');
var punt = require('punt');
const bh = require('./bufferhelp');
const gFormat = require('./format');
const message = require('./message');
const bindMsg = message.bindMsg;
var addr;

function PoetClient(miners, link_no, coin, name = '') {
    this.POET_POOL_HEARTBEAT = 5 * 1000;    // heartbeat every 5 seconds, can be 5 sec ~ 50 min (3000 sec)
    this.PEER_ADDR_ = [];          // ('192.168.1.103',30303)

    this._active = false;

    this.miners = miners;
    this._name = name + '>';
    this._link_no = link_no;
    this._coin = coin;

    this._last_peer_addr = null;

    this._recv_buffer = '';
    this._last_rx_time = 0
    this._last_pong_time = 0

    this._reject_count = 0
    this._last_taskid = 0
    this._time_taskid = 0
    this._compete_src = [];

    this.socket = dgram.createSocket('udp4');

    this.set_peer = set_peer;
}

function set_peer(peer_addr) {
    var s = this.PEER_ADDR_;
    var ip = peer_addr[0], port = peer_addr[1];
    var _isIP = isIP(ip);
    if (_isIP) {
        //todo
        // this.PEER_ADDR_=[]
    } else {
        var ip = '';
        // dns.lookup(hostname, (err, ip_addr, family) => {
        //     if (err) { console.log('invalid hostname'); return; }
        //     console.log('ip_addr:', ip_addr);
        //     this.PEER_ADDR_ = [ip_addr, port];
        //     this._last_peer_addr = this.PEER_ADDR_;
        // })
    }
}

function isIP(ip) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return re.test(ip);
}

//负责发送数据包
PoetClient.prototype.start = function () {
    this._active = true;
    setInterval(() => {
        if (this._active) {
            try {
                this.heartbeat();
            } catch (error) {
                console.log('heartbeat error:', error);
            }
        }
    }, this.POET_POOL_HEARTBEAT);

}

PoetClient.prototype.invalid_command = function () {
    console.log('');
}

PoetClient.prototype.heartbeat = function () {
    if (this.PEER_ADDR_.length == 0) return;
    var now = timest();
    if ((now - this._time_taskid) > 1800) {
        this._last_taskid = 0;
    }
    if (this._reject_count > 120) {
        this._reject_count = 0;
        this._last_taskid = 0;
    }
    if ((now - this._last_rx_time) > 1800 && this._last_peer_addr) {
        try {
            var sock = dgram.createSocket('udp4');
            this.socket.close();
            this.socket = sock;
            this.set_peer(this._last_peer_addr);
        } catch (error) {

            console.log('renew socket err:', error);
        }
    }

    var compete_src = this._compete_src;
    if (compete_src.length == 6) {
        var miners = this.miners;
        var sn = compete_src[0], block_hash = compete_src[1], bits = compete_src[2], txn_num = compete_src[3], link_no = compete_src[4], hi = compete_src[5];
        var succ_miner = '', succ_sig = '';
        for (i in miners) {
            console.log(typeof miners[i]);
            var sig = miners[i].check_elapsed(block_hash, bits, txn_num, now, '00', hi);
            if (sig) {
                succ_miner = miner;
                succ_sig = sig;
                break;
            }
        }

        if (succ_miner) {
            this._compete_src = [];

            // var msg = protocol.PoetResult(
            //     link_no, sn, succ_miner.pub_keyhash, succ_sig)
            // tm = time.localtime(now)
            // console.log('>>> success mining');


            var msg = new PoetResult(link_no, sn, succ_miner.pub_keyhash, succ_sig);
            var buf = new Buffer(0);
            var _bindMsg = new bindMsg(gFormat.poetresult);
            var b = _bindMsg.binary(msg, buf);
            var command = 'poetresult';
            var msg_buf = message.g_binary(b, command);
            this.send_message(msg_buf, this.PEER_ADDR_);
            console.log('>>>>>>>>>>>> success mining <<<<<<<<<<<<<<');
            console.log(`${this._name} success mining: link=${link_no}, height=${hi}, sn=${sn}, miner=${succ_miner.pub_keyhash}'`);
            sleep(this.POET_POOL_HEARTBEAT);

        }

    }
    if (now >= (this._last_rx_time + this.POET_POOL_HEARTBEAT / 1000)) {
        var msg = new GetPoetTask(this._link_no, this._last_taskid, this._time_taskid);
        var buf = new Buffer(0);
        var _bindMsg = new bindMsg(gFormat.poettask);
        var b = _bindMsg.binary(msg, buf);
        var command = 'poettask';
        var msg_buf = message.g_binary(b, command);
        this.send_message(msg_buf, this.PEER_ADDR_);
    }
}

PoetClient.prototype.send_message = function (msg, peer_addr) {
    var that = this;
    //msg->binary
    this.socket.send(msg, 0, msg.length, this.PEER_ADDR_[1], this.PEER_ADDR_[0], function (err, bytes) {
        if (err) {
            console.log('send err');
        } else {
            // console.log('>>> send data:',bh.bufToStr(msg),bh.bufToStr(msg).length);
        }
    });

    this.socket.on('message', function (msg, rinfo) {
        // console.log('>>> res data', bh.bufToStr(msg),bh.bufToStr(msg).length);
        that._recv_buffer = msg;
        that._last_rx_time = timest();
        addr = rinfo;

        if (that._recv_buffer) {
            var len = first_msg_len(that._recv_buffer);
            if (len && len <= that._recv_buffer.length) {
                var data = that._recv_buffer.slice(0);
                try {
                    var payload = message.g_parse(data);
                    that._recv_buffer = that._recv_buffer.slice(len);
                    len = first_msg_len(that._recv_buffer);
                    that._msg_ = payload;
                    try {
                        that.handle_message(payload, that);
                    } catch (error) {
                        console.log('handle_message err');
                    }
                } catch (error) {
                    console.log('handle err:', error);

                }
            }
        }
    })

}

PoetClient.prototype.handle_message = function (payload, that) {
    var sCmd = message.command;
    // console.log('>>> sCmd:', sCmd);
    if (sCmd == 'poetinfo') {
        var _bindMsg = new bindMsg(gFormat.poetinfo);
        var msg = _bindMsg.parse(payload, 0)[1];
        // console.log('>>> sCmd:%s\n>>> msg:%o',sCmd,msg);
        
        // console.log('>>> sCmd:%s', sCmd);
        if (msg.curr_id > that._last_taskid) {
            // this._compete_src = ;
            that._compete_src = [msg.curr_id, msg.block_hash, msg.bits, msg.txn_num, msg.link_no, msg.height];
            that._last_taskid = msg.curr_id;
            that._time_taskid = that._last_rx_time;
            that._reject_count = 0;
            console.log('>>> (%s) receive a task: link=%d,height=%d,sn=%d', that._name, msg.link_no, msg.height, msg.curr_id);
        }
    } else if (sCmd = 'poetreject') {//状态未更新ok
        var _bindMsg = new bindMsg(gFormat.poetreject);
        var msg = _bindMsg.parse(payload, 0)[1];
        if (msg.timestamp == that._time_taskid) {
            var b = bh.hexStrToBuffer(msg.reason);
            var reason = b.toString('latin1');
            // console.log('>>> sCmd:%s %s\n>>> msg:%o',sCmd,reason,msg);
            console.log('>>> sCmd:%s %s', sCmd, reason);
            //missed task old
            //invalid current task not exist
            if (reason == 'missed' && that._last_taskid == msg.sequence) {

            } else {
                //invalid
                that._compete_src = [];
                that._reject_count += 1;
            }
        }
        that._last_pong_time = that._last_rx_time;
    } else if (sCmd == 'pong') {
        console.log('>>> sCmd:%s\n>>> msg:%o', sCmd, msg);
        that._last_pong_time = that._last_rx_time;
    }
}

function GetPoetTask(link_no, curr_id, timestamp) {
    this.link_no = link_no;
    this.curr_id = curr_id;
    this.timestamp = timestamp;
}

function PoetResult(link_no, curr_id, miner, sig_tee) {
    this.link_no = link_no;
    this.curr_id = curr_id;
    this.miner = miner;
    this.sig_tee = sig_tee;
}

function first_msg_len(data) {
    if (data == undefined) return 0;
    if (data.length < 20) {// not enough to determine payload size yet
        return 0;
    }
    return data.length;
    //todo
    // return struct.unpack('<I', data.slic)[0] + 24
}

function exit() {
    var s = this._recv_buffer;
    console.log(s);
}

function sleep(delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay) {
        //堵塞
    }
}

function timest() {
    var tmp = Date.parse(new Date()).toString();
    tmp = tmp.substr(0, 10);
    return parseInt(tmp);
}

module.exports = {
    PoetClient
}

