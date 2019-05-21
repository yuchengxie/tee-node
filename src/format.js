var txns = {
    getFmt: function () {
        return 'txn[]';
    }
}

var txn = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['tx_in', tx_ins],
            ['tx_out', tx_outs],
            ['lock_time', 'I'],
            ['sig_raw', varstr],
        ];
    }
}

var tx_outs = {
    getFmt: function () {
        return 'tx_out[]';
    }
}

var tx_out = {
    getFmt: function () {
        return [
            ['value', 'q'],
            ['pk_script', varstr],
        ]
    }
}

var tx_ins = {
    getFmt: function () {
        return 'tx_in[]';
    }
}

var tx_in = {
    getFmt: function () {
        return [
            ['prev_output', outpoint],
            ['sig_script', varstr],
            ['sequence', 'I'],
        ]
    }
}

var outpoint = {
    getFmt: function () {
        return [
            ['hash', byte(32)],
            ['index', 'I'],
        ]
    }
}

var varstr = {
    getFmt: function () {
        return 'VS[]';
    }
}

var varInt = {
    getFmt: function () {
        return 'VInt[]';
    }
}

var str = (n) => {
    return 'S[' + n + ']';
}

var byte = (n) => {
    return 'B[' + n + ']';
}

var found = {
    getFmt: function () {
        return [
            // ['uock', 'q'],
            ['uock', 'uq'],
            ['value', 'q'],
            ['height', 'I'],
        ]
    }
}

var founds = {
    getFmt: function () {
        return 'found[]';
    }
}

var info = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['timestamp', 'I'],
            ['account', varstr],
            ['search', 'I'],
            ['found', founds],
        ];
    }
}

var utxo = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['heights', 'I[]'],
            ['indexes', 'I[]'],
            ['txns', txns],
        ];
    }
}


var block = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['heights', 'I[]'],
            ['txcks', 'q[]'],
            ['headers', blockheaders],
        ];
    }
}

var blockheaders = {
    getFmt: function () {
        return 'blockheader[]';
    }
}

var blockheader = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['link_no', 'I'],
            ['prev_block', byte(32)],
            ['merkle_root', byte(32)],
            ['timestamp', 'I'],
            ['bits', 'I'],
            ['nonce', 'I'],
            ['miner', byte(32)],
            ['sig_tee', varstr],
            ['txn_count', varInt],
        ]
    }
}

var pay_from = {
    getFmt: function () {
        return [
            ['value', 'q'],
            ['address', varstr],
        ]
    }
}

var pay_froms = {
    getFmt: function () {
        return 'pay_from[]';
    }
}

var pay_tos = {
    getFmt: function () {
        return 'pay_to[]';
    }
}

var pay_to = {
    getFmt: function () {
        return [
            ['value', 'q'],
            ['address', varstr],
        ]
    }
}

var last_uocks = {
    getFmt: function () {
        return 'uq[]';
        // return 'q[]';
    }
}

var makesheet = {
    getFmt: function () {
        return [
            ['vcn', 'H'],
            ['sequence', 'I'],
            ['pay_from', pay_froms],
            ['pay_to', pay_tos],
            ['scan_count', 'H'],
            // ['min_utxo', 'q'],
            ['min_utxo', 'uq'],
            // ['max_utxo', 'q'],
            ['max_utxo', 'uq'],
            ['sort_flag', 'I'],
            ['last_uocks', 'uq[]'],
        ]
    }
}

var varStrLists = {
    getFmt: function () {
        return 'varStrList[]'
    }
}

var varStrList = {
    getFmt: function () {
        return [
            ['items', varstr]
        ]
    }
}

var orgsheet = {
    getFmt: function () {
        return [
            ['sequence', 'I'],
            ['pks_out', varStrLists],
            // ['last_uocks', 'q[]'],
            ['last_uocks', 'uq[]'],
            ['version', 'I'],
            ['tx_in', tx_ins],
            ['tx_out', tx_outs],
            ['lock_time', 'I'],
            ['signature', varstr],
        ]
    }
}

var flextxn = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['tx_in', tx_ins],
            ['tx_out', tx_outs],
            ['lock_time', 'I'],
        ]
    }
}

var transaction = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['tx_in', tx_ins],
            ['tx_out', tx_outs],
            ['lock_time', 'I'],
            ['sig_raw', varstr],
        ]
    }
}

var udpconfirm = {
    getFmt: function () {
        return [
            ['hash', byte(32)],
            // ['args', 'q']
            // ['args', 'uq']
            // ['args', 'q']
            ['args', 'uq']
        ]
    }
}

var udpreject = {
    getFmt: function () {
        return [
            ['sequence', 'I'],
            ['message', varstr],
            ['source', varstr]
        ]
    }
}

var poettask = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['curr_id', 'I'],
            ['timestamp', 'I']
        ]
    }
}

var poetinfo = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['curr_id', 'I'],
            ['block_hash', byte(32)],
            ['bits', 'I'],
            ['height', 'I'],
            ['prev_time', 'q'],
            ['curr_time', 'q'],
            ['txn_num', 'I']
        ]
    }
}

var poetreject = {
    getFmt: function () {
        return [
            ['sequence', 'I'],
            ['timestamp', 'I'],
            ['reason', varstr]
        ]
    }
}

var poetresult={
    getFmt:function(){
        return [
            ['link_no','I'],
            ['curr_id','I'],
            ['miner',byte(32)],
            ['sig_tee',varstr],
        ]
    }
}

var gFormat = {
    // 'I': null,
    'S': null,
    'VS': varstr,
    'VInt': varInt,

    'txn': txn,
    'tx_in': tx_in,
    'tx_out': tx_out,
    'outpoint': outpoint,
    'utxo': utxo,

    'found': found,
    'founds': founds,
    'info': info,

    'blockheader': blockheader,
    'block': block,

    'pay_from': pay_from,
    'pay_to': pay_to,
    'makesheet': makesheet,

    'varStrList': varStrList,
    'orgsheet': orgsheet,

    'flextxn': flextxn,

    'transaction': transaction,

    'udpconfirm': udpconfirm,
    'udpreject': udpreject,
    'poettask': poettask,
    'poetinfo': poetinfo,
    'poetreject': poetreject,
    'poetresult':poetresult
}



module.exports = gFormat;
