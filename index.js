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
    var args, command, deferred, socket;
    command = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    
    deferred = Q.defer();

    // Set a timeout to receive data otherwise thrown an error
    Q.delay(this.timeout).then(function () {
      deferred.reject(new Error("Timed out"));
    });

    socket = net.connect({
      host: this.host,
      port: this.port
    });

    socket.on("error", function(err) {
      return deferred.reject(err);
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
          Q.when(buffer, deferred.resolve(JSON.parse(buffer.replace(/[^\}]+$/, ""))));
          // return deferred.resolve(JSON.parse(buffer.replace(/[^\}]+$/, "")));
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

  CGMinerClient.prototype._version = function(r) {
    return r.VERSION[0];
  };

  CGMinerClient.prototype._devs = function(r) {
    return r.DEVS;
  };

  return CGMinerClient;

})();

ref = ["pga", "gpu", "asc"];
fn = function(device) {
  var deviceUC;
  deviceUC = device.toUpperCase();
  CGMinerClient.prototype["_" + device] = function(r) {
    return r["" + deviceUC][0];
  };
  return CGMinerClient.prototype["_" + device + "count"] = function(r) {
    return r[deviceUC + "S"][0].Count;
  };
};
for (i = 0, len = ref.length; i < len; i++) {
  device = ref[i];
  fn(device);
}

CGMinerClient.commands = require("./commands").getCommands();

ref1 = CGMinerClient.commands;
fn1 = function(name, command) {
  return CGMinerClient.prototype[name] = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this.request.apply(this, [name].concat(args)).then((function(_this) {
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
};
for (name in ref1) {
  command = ref1[name];
  fn1(name, command);
}

module.exports = CGMinerClient;
