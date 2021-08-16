const SerialPort = require("serialport");

class Gen4Switch{
    //Properties
    #serialPort;
    #portNum;
    #rackNum;
    #DHCPStartHost;
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

        switch(this.#switchNum){
            case 1:
                this.#DHCPStartHost = 1;
                this.#rackNum = 1;
                break;
            case 2:
                this.#DHCPStartHost = 48;
                this.#rackNum = 1;
                break;
            case 3:
                this.#DHCPStartHost = 95;
                this.#rackNum = 1;
                break;
            case 4:
                this.#DHCPStartHost = 1;
                this.#rackNum = 2;
                break;
            case 5:
                this.#DHCPStartHost = 48;
                this.#rackNum = 2;
                break;
            case 6:
                this.#DHCPStartHost = 95;
                this.#rackNum = 2;
                break;
        }
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
        commands += `ip domain-name bit5ive\n`;
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
        commands += `crypto key generate rsa\n`;
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
        commands += `no ip http secure-server\n`;
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

    generateReservationString(){
        let portNum = 1;
        let hostNum = this.#DHCPStartHost;
        let result;
        for(let i = 1; i < 48; i++){
            result += `address 10.${this.#containerNum}.${this.#rackNum}.${hostNum} client-id "Gi1/0/${portNum}" ascii\n`;
            hostNum++;
            portNum++;
        }
        return result;
    }
}

module.exports = {
    Gen4Switch
}