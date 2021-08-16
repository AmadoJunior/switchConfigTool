const {Gen4Switch} = require("./Gen4Switch/Gen4Switch");

const mySwitch = new Gen4Switch(7, 9600, 2, 5, "POD5Pass555");
mySwitch.initPort();
mySwitch.enableProtected();
// mySwitch.setupDHCPServer();
mySwitch.closeConnection();