BLE WiFi Setup
-----------------
This project is to enable completely and truly headless WiFi setup through using mobile phone app for devices such as Raspberry Pi, equipped with both bluetooth and wifi.

Once the device-app is installed and running on the device, the provided cordova mobile app (or Evothings app) connects using bluetooth and allows user to select an available WiFi network. The WiFi setting will be remember even if the device is restarted.

Special thanks to Evothings (https://evothings.com/) for the tutorials and example codes which made this possible :)


Device Installation
--------------------
These instructions have been tested on Raspberry Pi Zero W w/ Raspberrian OS.

- Make sure you have Bluez version 5.x.x or higher installed::
 
    hcitool | grep ver
    
- Disable builtin bluetooth::
 
    sudo systemctl stop bluetooth
    sudo systemctl status bluetooth
    sudo systemctl disable bluetooth
 
- Power up the bluetooth device::
 
    sudo hciconfig hci0 up
 
- Install git and other dependencies::
 
    sudo apt-get update
    sudo apt-get install git libudev-dev
    
- Install node 5.9.1 or higher
- Clone the repo and test run device-app on the device::
 
     cd device-app
     npm install
     sudo node index.js

     # You should see the following lines:
     #   on -> stateChange: poweredOn
     #   on -> advertisingStart: success

- If all works, set it up to run on system boot::

     sudo vi /etc/rc.local

     # add the following lines just before exit 0 (the last line)
     hciconfig hci0 up
     nohup node /home/pi/pi-bluetooth-setup/pi-application/index.js &

The Mobile App
-------------------

You may simply install and run the prebuilt Android app available under cordova-app by copying the build to your Android device. Alternatively you may recompile the cordova app or use Evothings Viewer to quickly make edits and test.

