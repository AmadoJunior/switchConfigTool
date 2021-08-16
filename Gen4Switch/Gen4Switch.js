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
        this.#serialPort.on('open', () => {
            console.log( `Serial Port #${this.#portNum} Opened.`);
        })
        
        this.#serialPort.on('error', (err) => {
            console.log('Error: ', err.message);
        })
        
        this.#serialPort.on('data', (data) => {
            process.stdout.write(data.toString());
        })
    }

    enable(){
        let commands = `\nno\nen\n`;
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    enableProtected(){
        let commands = `\nno\nen\n${this.#password}\n`;
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setCredentials(){
        let commands = `configure terminal\n`;
        commands += `hostname POD5C${this.#containerNum}S${this.#switchNum}\n`;
        commands += `username admin password POD5Pass555\n`;
        commands += `ip domain-name bit5ive`;
        commands += `enable password POD5Pass555\n`;
        commands += `end\n`;
        commands += `wr\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setSSH(){
        let commands = `configure terminal\n`;
        commands += `ip default-gateway 10.${this.#containerNum}.100.100\n`;
        commands += `interface vlan 1\n`;
        commands += `ip address 10.${this.#containerNum}.${this.#switchNum}.100 255.255.0.0\n`;
        commands += `exit\n`;
        commands += `crypto keys generate rsa\n`;
        commands += `768\n`;
        commands += `ip ssh time-out 60\n`;
        commands += `ip ssh authentication-retries 5\n`;
        commands += `line vty 0 15\n`;
        commands += `transport input SSH\n`;
        commands += `login local\n`;
        commands += `end\nwr\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setTime(){
        let commands = `configure terminal\n`;
        commands += `ntp server 216.239.35.0\n`;
        commands += `clock timezone est -5 0\n`;
        commands += `end\n`;
        commands += `wr\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    disableHTTPServer(){
        let commands = `configure terminal\n`;
        commands += `no ip http server\n`;
        commands += `np ip http secure-server\n`;
        commands += `end\n`;
        commands += `wr\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setDHCPServer(){

    }
}

module.exports = {
    Gen4Switch
}