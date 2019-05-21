const { ipcRenderer } = require('electron')

const smartcard = require('smartcard');
const CTime = require('china-time');
const bh = require('./bufferhelp');
const hexify = require('hexify');
const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;
const PseudoWallet = require('./pseudowallet').PseudoWallet;

const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;
var application;

// var SELECT = '00A404000ED196300077130010000000020101';
var SELECT = 'D196300077130010000000020101';
var cmd_pubAddr = '80220200020000';
var cmd_pubkey = '8022000000';
var cmd_pubkeyHash = '8022010000';
var GET_RESPONSE = '0x00c00000';

var __time__ = () => { return `${CTime("YYYY-MM-DD HH:mm:ss")}` };
var pseudoWallet;

window.onload = function () {
    let getAccount = document.getElementById('getPubkey');
    getAccount.onclick = function () {
        application.issueCommand(str_commandApdu(cmd_pubkey)).then(res => {
            console.log('>>> getPubkey:', res.data);
        }).catch(err => {
            console.log('getPubkey err:', err);
            return;
        })
    }

    let getAddress = document.getElementById('getAddress');
    getAddress.onclick = function () {
        application.issueCommand(str_commandApdu(cmd_pubAddr)).then(res => {
            console.log('>>> getAddress:', res.data);
        }).catch(err => {
            console.log('getAddress err:', err);
            return;
        })
    }

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
                if (result.length <= 4) return result;
                if (result.slice(result.length - 4, result.length).includes('9000')) {
                    result = result.slice(0, result.length - 4);
                    console.log(`> [${__time__()}] Response '${result}' received from '${event.card}' --- in response to Command '${event.command}'`);
                    return result;
                }
                var res_buf = event.response.buffer;
                if (res_buf[0] == 0x61 && iLoop < 32) {
                    var sw2 = bh.bufToStr(res_buf.slice(1));
                    var s = GET_RESPONSE + sw2;
                    console.log('>>> GET_RESPONSE + [sw2]:', s);
                    iLoop++;
                    return application.issueCommand(new CommandApdu({ bytes: hexify.toByteArray(s) })).then(res => {
                        result += res;
                        return result;
                    })
                }
                console.log('>>> final result:', result);
                return result;
            })

            //get tee wallet
            application.selectFile(hexify.toByteArray(SELECT))
                .then(res => {
                    var pubkey, pubkeyHash;
                    if (!res) { console.log('error'); return; }
                    application.issueCommand(str_commandApdu(cmd_pubkey)).then(res => {
                        console.log('>>> cmd_pubkey:', res.data.slice(0, res.data.lenght - 4));
                        // pubkey = res.data.slice(0, res.data.lenght - 4);
                        pubkey = res.data;
                        application.issueCommand(str_commandApdu(cmd_pubkeyHash)).then(r => {
                            // console.log('>>> cmd_pubAddr:', r.data.slice(0, r.data.lenght - 4));
                            console.log('>>> cmd_pubAddr:', r.data);
                            pubkeyHash = r.data.slice(0, r.data.lenght - 4);
                            pseudoWallet = new PseudoWallet(pubkey, pubkeyHash);
                            console.log('>>> pseudoWallet:', pseudoWallet);
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
}

function str_commandApdu(s) {
    return new CommandApdu({ bytes: hexify.toByteArray(s) })
}


