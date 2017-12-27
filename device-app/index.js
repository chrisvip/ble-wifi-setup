var bleno = require('bleno');

var SystemInformationService = require('./systeminformationservice');

var systemInformationService = new SystemInformationService();

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var bname = bleno.name || 'Pi Device';
    bleno.startAdvertising(bname, [systemInformationService.uuid]);
  }
  else {

    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {

  console.log('on -> advertisingStart: ' +
    (error ? 'error ' + error : 'success')
  );

  if (!error) {

    bleno.setServices([
      systemInformationService
    ]);
  }
});
