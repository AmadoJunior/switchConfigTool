const SerialPort = require("serialport");

class Gen4Switch{
    //Properties
    #serialPort;
    #portNum;
    #rackNum;
    #DHCPStartHost;
    #baudRate;
    #generation;
    #containerNum;
    #switchNum;
    #password;
    isOpen;
    #interfaceNumber

    //Constructor
    constructor(portNum, baudRate, generation, containerNum, switchNum, password, interfaceNumber){
        this.#portNum = portNum;
        this.#baudRate = baudRate;
        this.#generation = generation;
        this.#containerNum = containerNum;
        this.#switchNum = switchNum;
        this.#password = password;
        this.#interfaceNumber = interfaceNumber;
        this.isOpen = false;

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
        this.#serialPort = new SerialPort(`COM${this.#portNum}`, {baudRate: this.#baudRate}, (err) => {
            if(err){
                this.isOpen = false;
                return console.log("Error: " + err.message);
            }
        });
        this.#serialPort.on('open', () => {
            this.isOpen = true;
            console.log(`Serial Port #${this.#portNum} Opened.`);
        })

        this.#serialPort.on('close', () => {
            this.isOpen = false;
            console.log(`Serial Port #${this.#portNum} Closed.`)
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
        let commands = `\nno\nen\n${this.#password}\n\n`;
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setCredentials(){
        let commands = `configure terminal\n`;
        //Hostname
        commands += `hostname POD5C${(this.#generation*10) + this.#containerNum}S${this.#switchNum}\n`;
        //Login Local User
        commands += `username admin password ${this.#password}\n`;
        //Domain
        commands += `ip domain-name uta.POD5C${(this.#generation*10) + this.#containerNum}S${this.#switchNum}.local\n`;
        //Enable Password
        commands += `enable password ${this.#password}\n`;
        commands += `end\n`;
        commands += `wr\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })
    }

    setupSSH(){
        let commands = `configure terminal\n`;
        //Default Gateway
        commands += `ip default-gateway 10.${(this.#generation*10) + this.#containerNum}.100.100\n`;
        //VLAN1 SVI
        commands += `interface vlan 1\n`;
        commands += `ip address 10.${(this.#generation*10) + this.#containerNum}.${this.#switchNum}.200 255.255.0.0\n`;
        commands += `no shut\n`;
        commands += `exit\n`;
        //Generating RSA Key
        commands += `crypto key generate rsa\n`;
        commands += `768\n`;
        //SSH Settings
        commands += `ip ssh time-out 60\n`;
        commands += `ip ssh authentication-retries 5\n`;
        //Terminal Settings
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
        //Setting NTP Server && Timezone
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
        //Diasble HTTP Server
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

    setupDHCPServer(){
        let commands = `configure terminal\n`;
        //Port-Based DHCP Settings
        commands += `ip dhcp use subscriber-id client-id\n`;
        commands += `ip dhcp subscriber-id interface-name\n`;
        commands += `interface range Gi${this.#interfaceNumber}/0/1-47\n`;
        commands += `ip dhcp server use subscriber-id client-id\n`;
        commands += `no shut\n`;
        commands += `exit\n`;
        //Configure Pool
        commands += `no ip dhcp pool POOL1\n`;
        commands += `ip dhcp pool POOL1\n`;
        commands += `network 10.${(this.#generation*10) + this.#containerNum}.0.0 255.255.0.0\n`;
        commands += `default-router 10.${(this.#generation*10) + this.#containerNum}.100.100\n`;
        commands += `dns-server 8.8.8.8 4.2.2.2\n`;
        commands += `reserved-only\n`;
        
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
              return console.log('Error on Write: ', err.message);
            }
        })

        //Generate Reservations
        this.generateReservations();
        commands = "";
        commands += `end\n`;
        commands += `wr\n`;
        this.#serialPort.write(Buffer.from(commands), (err) => {
            if (err) {
            return console.log('Error on Write: ', err.message);
            }
        })
    }

    generateReservations(){
        let hostNum = this.#DHCPStartHost;
        let commands = "";
        for(let portNum = 1; portNum < 48; portNum++){
            //Generate Reservations
            commands = "";
            commands += `address 10.${(this.#generation*10) + this.#containerNum}.${this.#rackNum}.${hostNum} client-id "Gi${this.#interfaceNumber}/0/${portNum}" ascii\n`;
            this.#serialPort.write(Buffer.from(commands), (err) => {
                if (err) {
                return console.log('Error on Write: ', err.message);
                }
            })
            hostNum++;
        }
    }

    closeConnection(){
        if(this.isOpen){
            console.log("Closing Connection");
            this.#serialPort.drain( err => {
                if(err){
                    console.log(err);
                } else {
                    this.#serialPort.close( err => {
                        console.log(err);
                    })
                    this.isOpen = false;
                }
                
            })
            
        } else {
            console.log("Nothing to Close")
        }
    }
}

module.exports = {
    Gen4Switch
}
