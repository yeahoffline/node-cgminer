node-cgminer
============

Forked from: [node-cgminer](https://github.com/tlrobinson/node-cgminer)

Usage
-----

CGMiner command return a Promises/A compatible promise (specifically a [Q](https://github.com/kriskowal/q) promise):

    var client = new CGMinerClient({host: HOST, port: PORT, timeout: TIMEOUT});
    client.cmd(COMMAND, ARG1, ARG2).then(function(results) {
      console.log(results);
    }, function(err) {
      // error handler
    });

COMMAND corresponds to one of the commands detailed in [CGMiner's API documentation](https://github.com/ckolivas/cgminer/blob/master/API-README).
