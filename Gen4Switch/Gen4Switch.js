const SerialPort = require("serialport");

class Gen4Switch{
    //Properties
    #serialPort;
    #portNum;
    #baudRate;
    #containerNum;
    #switchNum;
    #password;

    //Constructor
    constructor(portNum, baudRate, containerNum, switchNum, password){
        this.#portNum = portNum;
        this.#baudRate = baudRate;
        this.#containerNum = containerNum;
        this.#switchNum = switchNum;
        this.#password = password;
    }

    //Methods
    initPort(){
        this.#serialPort = new SerialPort(`/dev/ttyS${this.#portNum}`, {baudRate: this.#baudRate}, (err) => {
            if(err){
                return console.log("Error: " + err.message);
            }
        });
        this.#serialPort.on('open', function() {
            console.log( `Serial Port #${this.#portNum} Opened.`)
        })
        
        this.#serialPort.on('error', function(err) {
            console.log('Error: ', err.message)
        })
        
        this.#serialPort.on('data', function (data) {
            console.log('Data:', data.toString())
        })
    }

    enable(){
        this.#serialPort.write(Buffer.from('en\n'), function(err) {
            if (err) {
              return console.log('Error on Write: ', err.message)
            }
            console.log('Enable Command Success')
        })
    }

    setCredentials(){
        
    }

    setSSH(){

    }

    setTime(){

    }

    setGateway(){

    }

    setVlan(){

    }

    disableServer(){

    }

    setDHCPServer(){

    }
}

module.exports = {
    Gen4Switch
}