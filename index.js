var CGMinerClient, Q, command, device, fn, fn1, i, len, name, net, ref, ref1,
  slice = [].slice;

net = require("net");
Q = require("q");

CGMinerClient = (function() {
  function CGMinerClient(options) {
    if (options == null) {
      options = {};
    }
    this.host = options.host || "127.0.0.1";
    this.port = options.port || 4028;
    this.timeout = options.timeout || 3000;
  }

  CGMinerClient.prototype.request = function() {
    var args, command, deferred, socket, timeoutMsg;
    command = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    timeoutMsg = "Connection to " + this.host + ":" + this.port + " timed out";
    deferred = Q.defer();

    // Set a timeout to receive data otherwise thrown an error
    Q.delay(this.timeout+1000).then(function () {
      return deferred.reject(new Error(timeoutMsg));
    });

    socket = net.connect({
      host: this.host,
      port: this.port
    });

    socket.setTimeout(this.timeout);

    socket.on("error", function(err) {
      return deferred.reject(err);
    });

    socket.on("timeout", function() {
      socket.end();
      return deferred.reject(new Error(timeoutMsg));
    });

    socket.on("connect", function() {
      var buffer;
      buffer = "";

      socket.on("data", function(data) {
        return buffer += data.toString();
      });

      socket.on("end", function() {
        var err;
        try {
          Q.when(buffer, deferred.resolve(JSON.parse(buffer.replace(/[^\}]+$/, "").replace('}{', '},{'))));
        } catch (_error) {
          err = _error;
          return deferred.reject(err);
        }
      });

      return socket.write(JSON.stringify({
        command: command,
        parameter: args.join(",")
      }));
    });
    return deferred.promise;
  };

  return CGMinerClient;

})();

CGMinerClient.prototype.cmd = function() {
  var args;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  return this.request.apply(this, args).then((function(_this) {
    return function(result) {
      if (_this["_" + name] != null) {
        return Q["try"](function() {
          return _this["_" + name](result);
        });
      } else {
        return result;
      }
    };
  })(this));
};

module.exports = CGMinerClient;
