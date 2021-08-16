/**
 * Args: <Container #> <Switch #>
 */
 let myArgs = process.argv.slice(2);
 let result = "";
 let containerNum = myArgs[0];
 let hostNum = 0;
 let rackNum = 0;
 let portNum = 1;
 
 switch(parseInt(myArgs[1])){
     case 1:
         hostNum = 1;
         rackNum = 1;
         break;
     case 2:
         hostNum = 48;
         rackNum = 1;
         break;
     case 3:
         hostNum = 95;
         rackNum = 1;
         break;
     case 4:
         hostNum = 1;
         rackNum = 2;
         break;
     case 5:
         hostNum = 48;
         rackNum = 2;
         break;
     case 6:
         hostNum = 95;
         rackNum = 2;
         break;
 }
 
 for(let i = 1; i < 48; i++){
     result += `address 10.${containerNum}.${rackNum}.${hostNum} client-id "Gi1/0/${portNum}" ascii\n`;
     hostNum++;
     portNum++;
 }
 
 console.log(result);