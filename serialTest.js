const SerialPort = require("serialport");
const port = new SerialPort("/dev/ttyS7", {baudRate: 9600}, (err) => {
    if(err){
        return console.log("Error: " + err.message);
    }
});

port.on('open', function() {
    console.log("Open Event")
})

port.on('error', function(err) {
    console.log('Error: ', err.message)
})

port.on('data', function (data) {
    process.stdout.write(data.toString())
})

let commands = `
    configure terminal\n
        hostname POD5C2S5\n
        end\n`
    ;

port.write(Buffer.from(commands), function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    //console.log('message written')
})