const net = require('net');
const tls = require('tls');
const assert = require('assert');

const ElectrumClient = require("./index");

(async () => {
    let client = new ElectrumClient(net, false, 50001, 'electrum1.bluewallet.io', 'tcp');
    let ver = await client.initElectrum({ client: 'bluewallet', version: '1.4' });
    let balance = await client.blockchainScripthash_getBalance('716decbe1660861c3d93906cb1d98ee68b154fd4d23aed9783859c1271b52a9c');
    assert.ok(balance)
    assert.ok(ver[0].toLowerCase().includes('electrum'));
    assert.strictEqual(balance.confirmed, 51432);

    client = new ElectrumClient(net, tls, 443, 'electrum1.bluewallet.io', 'ssl');
    ver = await client.initElectrum({ client: 'bluewallet', version: '1.4' });
    balance = await client.blockchainScripthash_getBalance('716decbe1660861c3d93906cb1d98ee68b154fd4d23aed9783859c1271b52a9c');
    assert.ok(balance)
    assert.ok(ver[0].toLowerCase().includes('electrum'));
    assert.strictEqual(balance.confirmed, 51432);

    process.exit(0);
})();
