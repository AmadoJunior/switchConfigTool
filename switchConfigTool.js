const {Gen4Switch} = require("./Gen4Switch/Gen4Switch");
const yargs = require("yargs");
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

/**
 * Arguments Example: node switchConfigTool.js --usbPortNum=7 --baudRate=9600 --generation=4 --containerNum=2 --switchNum=5 --password=POD5Pass555 --interfaceName=Gi --interfaceNumber=1 --protected=0 --si=0
 */

const mySwitch = new Gen4Switch(parseInt(argv.usbPortNum), 
                                parseInt(argv.baudRate), 
                                parseInt(argv.generation),
                                parseInt(argv.containerNum), 
                                parseInt(argv.switchNum), 
                                argv.password, 
                                argv.interfaceName,
                                parseInt(argv.interfaceNumber),
                                parseInt(argv.si));
//Open Port             
mySwitch.initPort();

//Enable Device
if(parseInt(argv.protected) === 1){
    mySwitch.enableProtected();
} else {
    mySwitch.enable();
}

//SetCreds
mySwitch.setCredentials();

//Setup SSH
mySwitch.setupSSH();

//Set Time
mySwitch.setTime();

//Disable HTTP Server (Optional)
//mySwitch.disableHTTPServer();