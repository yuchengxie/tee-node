const smartcard = require('smartcard');
const CTime = require('china-time');
const bh = require('./bufferhelp');
const hexify = require('hexify');
const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;
const PseudoWallet = require('./pseudowallet').PseudoWallet;
const PoetClient = require('./mine_client').PoetClient;
const dns = require('dns');
const struct = require('./struct');

const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;
var application;
var mine_hostname = 'user1-node.nb-chain.net';
var mine_port = 30302;
// var MINING_NODE_ADDR = ['user1-node.nb-chain.net', 30302];

// var SELECT = '00A404000ED196300077130010000000020101';
var SELECT = 'D196300077130010000000020101';
var cmd_pubAddr = '80220200020000';
var cmd_pubkey = '8022000000';
var cmd_pubkeyHash = '8022010000';
var GET_RESPONSE = '0x00c00000';

var __time__ = () => { return `${CTime("YYYY-MM-DD HH:mm:ss")}` };
var pseudoWallet;

// device - card
devices.on('device-activated', event => {
    let device = event.device;
    device.on('card-inserted', event => {
        var card = event.card;
        application = new Iso7816Application(card);
        console.log(`[${__time__()}] Card '${card.getAtr()}' Inserted into '${event.device}'`);
        card.on('command-issued', event => {
            console.log(`> [${__time__()}] Command issued '${event.command}' to '${event.card}'`);
        })

        var iLoop = 0;
        var result = '';

        card.on('response-received', event => {
            result = event.response.data;

            console.log(`> [${__time__()}] Response '${event.response.data}' received from '${event.card}' --- in response to Command '${event.command}'`);
            if (result.length < 4) return result;
            if (result.slice(result.length - 4, result.length).includes('9000')) {
                result = result.slice(0, result.length-4);
                console.log(`> [${__time__()}] Response '${result}' received from '${event.card}' --- in response to Command '${event.command}'`);
                // return result;
            }
            var res_buf = event.response.buffer;
            if (res_buf[0] == 0x61 && iLoop < 32) {
                var sw2 = bh.bufToStr(res_buf.slice(1));
                var s = GET_RESPONSE + sw2;
                console.log('>>> GET_RESPONSE + [sw2]:', s);
                iLoop++;
                return application.issueCommand(new CommandApdu({ bytes: hexify.toByteArray(s) })).then(res => {
                    result += res;
                    // return result;
                })
            }
            console.log('>>> final result:', result);
            // return result;
        })

        //get tee wallet
        application.selectFile(hexify.toByteArray(SELECT))
            .then(res => {
                var pubkey, pubHash;
                if (!res) { console.log('error'); return; }
                application.issueCommand(str_commandApdu(cmd_pubkey)).then(res => {
                    pubkey = res.data.slice(0, res.data.length - 4);
                    application.issueCommand(str_commandApdu(cmd_pubkeyHash)).then(r => {
                        // pubHash = r.data.slice(0, r.data.length - 4);
                        //测试挖矿
                        // pseudoWallet = new PseudoWallet(pubkey, pubHash);
                        //矿工
                        // var tee = new TeeMiner(pubHash);
                        // var gPoetClient = new PoetClient([tee], 0, '', 'clinet1');

                        // dns.lookup(mine_hostname, (err, ip_addr, family) => {
                        //     if (err) { console.log('invalid hostname'); return; }
                        //     console.log('dns ip_addr:', ip_addr);
                        //     // this.PEER_ADDR_ = [ip_addr, port];
                        //     gPoetClient.PEER_ADDR_ = [ip_addr, mine_port];
                        //     gPoetClient._last_peer_addr = gPoetClient.PEER_ADDR_;
                        //     gPoetClient.start();
                        //     gPoetClient.set_peer(gPoetClient.PEER_ADDR_);
                        // })
                    })
                })
            })
    })

    device.on('card-removed', event => {
        console.log(`> [${__time__()}] Card remove from '${event.name}'`);
    })
})

devices.on('device-deactivated', event => {
    console.log(`> [${__time__()}] Device '${event.device}' Deactivated`);
})

function str_commandApdu(s) {
    return new CommandApdu({ bytes: hexify.toByteArray(s) })
}

function TeeMiner(pubHash) {
    this.SUCC_BLOCKS_MAX = 256;
    this.succ_blocks = [];
}

TeeMiner.prototype.check_elapsed = function (block_hash, bits, txn_num, curr_tm = '', sig_flag = '00', hi = 0) {
    if (!application) return;
    if (!curr_tm) curr_tm = timest();
    try {
        var sCmd = '8023' + sig_flag + '00';
        sCmd = bh.hexStrToBuffer(sCmd);
        var sBlockInfo = Buffer.concat([bh.hexStrToBuffer(block_hash), struct.pack('<II', [bits, txn_num])]);
        var sData = Buffer.concat([struct.pack('<IB', [curr_tm, sBlockInfo.length]), sBlockInfo]);
        sCmd = Buffer.concat([sCmd, struct.pack('<B', [sData.length]), sData]);
        sCmd = bh.bufToStr(sCmd);
        application.issueCommand(sCmd).then(res => {
            console.log(res);
            if (res.data == '9000') {
                if (res.buffer.length > 64) {
                    this.succ_blocks.push([curr_tm, hi]);
                    if (this.succ_blocks.length > this.SUCC_BLOCKS_MAX) {
                        this.succ_blocks.splice(this.SUCC_BLOCKS_MAX, 1);
                    }
                    return Buffer.concat([res, Buffer.from(sig_flag)]);
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
    return '';
}

function timest() {
    var tmp = Date.parse(new Date()).toString();
    tmp = tmp.substr(0, 10);
    return parseInt(tmp);
}

function Newborntoken() {
    this.COINBASE_MATURITY = 8
    this.WEB_SERVER_ADDR = 'http://raw0.nb-chain.net'

    this.name = "newborntoken"
    this.symbols = ['NBT']         //all symbols
    this.symbol = symbols[0]      //rimary symbol

    // mining_coin_type = b'\x00'
    this.mining_coin_type = 0;
    // currency_coin_type = b'\x00'
    this.currency_coin_type = 0;
    this.protocol_version = 0

    // magic = b'\xf9\x6e\x62\x74'
    this.magic = '';

    this.raw_seed = ('raw%.nb-chain.net', 20303) // '52.80.85.68', tcp listen port is 20303

    this.genesis_version = 1
    // genesis_block_hash = decodeHex(b'1f4bb08cbc3370746a3de301511ab7395d2b439e497dc604d9062341a90d0000')
    this.genesis_block_hash = '';
    // genesis_merkle_root = decodeHex(b'e2fb0b95bc2294d046646592df8ffee4cf6df21a0cef0d95e9c712b45a7eddc0')
    this.genesis_merkle_root = '';
    this.genesis_timestamp = 1546517099
    this.genesis_bits = 2500
    // genesis_miner = decodeHex(b'be599666b155b9a4e87502f55aea4def3917a33f6d11672004a98304060ee8b8')
    this.genesis_miner = '';
    this.genesis_nonce = 47961596
    // genesis_signature = decodeHex(b'304402203d0894fbbae2f82657af91852e940ab87c2a000b97a1ed24ddb449caadff72be02202b99ad651aabd82a7822da763ca68cb9e6aaae1e9507af04d47a4526d20994cf00')
    this.genesis_signature = '';
    // genesis_txn = protocol.Txn(1,
    //     [protocol.TxnIn(protocol.OutPoint(b'\x00' * 32, 0xffffffff), struct.pack('<BI', 4, 0), 0xffffffff)],
    //     [protocol.TxnOut(1050000000000000, _PAY2MINER), protocol.TxnOut(0, _PAY2MINER)],
    //     0xffffffff, b'') # genesis block only contains one transaction
    this.genesis_txn = '';
}

