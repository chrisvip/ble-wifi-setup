const wifiscanner = require("wifiscanner");
const wifiName = require('wifi-name');
var bleno = require('bleno');
var os = require('os');
var util = require('util');
var fs = require('fs');
var exec = require('child_process').exec

var BlenoCharacteristic = bleno.Characteristic;

var WifiCharacteristic = function() {
  WifiCharacteristic.super_.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb1b',
    properties: ['read', 'write'],
  });

  this._value = new Buffer(0);
};

var networks = null;
var current_ssid = '';

WifiCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
      this._value = null;
        
      if (networks !== null){
          var _networks = networks.splice(0, 2);
          this._value = new Buffer(JSON.stringify(_networks));
          if (_networks.length <= 0) networks = null;
      } else {
          const scanner = wifiscanner();
          var current_ssid = wifiName.sync();
          scanner.scan((error, _networks) => {
              if (error) {
                  console.error(error);
              } else {
                  networks = [];
                  _networks.forEach(network => {
                      var _network = {'ssid': network.ssid, 'security': network.security, 'signal': network.signal_level};
                      if (network.ssid == current_ssid) {
                          _network['active'] = true;
                      }
                      networks.push(_network);
                  });
                  
                  this._value = new Buffer(JSON.stringify(networks.splice(0, 2)));

                  console.log('WifiCharacteristic - onReadRequest [' + offset + ']: value = ' +
                      this._value.slice(offset, offset + bleno.mtu +2).toString()
                  );
                  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
              }
          });
      }
    }

    if (this._value) {
        console.log('WifiCharacteristic - onReadRequest [' + offset + ']: value = ' +
            this._value.slice(offset, offset + bleno.mtu +2).toString()
        );
        callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
    }
};

WifiCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log("Write Request: ", data, offset, withoutResponse, callback);

    console.log("Received: |" + data.toString() + "|");
    
    var setting = JSON.parse(data.toString());
    
    ssid = setting.connect;
    pass = setting.pass;
    
    // Save the settings
    var filename = '/etc/wpa_supplicant/wpa_supplicant.conf';
    
    fs.readFile(filename, 'utf8', function(err, contents) {
        console.log("WPA conf: \n" + contents);
        
        contents = contents.replace(/network\s*=[\s\S]*?}/, '');
        if (pass) {
            contents += 
                'network={\n' +
                '   ssid="'+ssid+'"\n' +
                '   psk="'+pass+'"\n' +
                '   scan_ssid=1\n' +
                '}\n';
        } else {
            contents += 
                'network={\n' +
                '   ssid="'+ssid+'"\n' +
                '   key_mgmt=NONE"\n' +
                '   scan_ssid=1\n' +
                '}';
        }
        
        console.log("New content: \n" + contents);
        fs.writeFile(filename, contents, function(err) {
            if(err) {
                console.log(err);
                callback(this.RESULT_ERROR, new Buffer(JSON.stringify({})));
                return;
            }

            console.log("The file was saved!");
            
            var refreshCmd = 'killall -HUP wpa_supplicant';
            exec(refreshCmd, function(error, stdout, stderr) {
                console.log("wpa refresh: " + stdout);
            });
            
            callback(this.RESULT_SUCCESS, new Buffer(JSON.stringify({})));
        }); 
    });
}
    
util.inherits(WifiCharacteristic, BlenoCharacteristic);
module.exports = WifiCharacteristic;
