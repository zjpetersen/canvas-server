const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');


/*** Code to load canvas smart contract ***/
console.log("getting web3 connection");
// let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545"); //TODO infura
let web3;
if (process.env.DEPLOYMENT_ENV === "prod") {
    web3 = new Web3("https://mainnet.infura.io/v3" + process.env.INFURA_PROJECT_ID);
} else if (process.env.DEPLOYMENT_ENV === "test") {
    web3 = new Web3("https://rinkeby.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
} else {
    web3 = new Web3("ws://localhost:7545");
}

let pathTile = "CryptoCanvas.json";
let abiTile = JSON.parse(fs.readFileSync(pathTile, 'utf8')).abi;
let tileAddr; 
let defaultBlock;
readContractAddresses();

let tile = new web3.eth.Contract(abiTile, tileAddr);

function readContractAddresses() {
    let data = fs.readFileSync('src/contractInfo.config');
    let dataArr = data.toString().split(',');
    tileAddr = dataArr[0];
    defaultBlock = dataArr[1]-1;
    console.log(tileAddr);
    console.log(defaultBlock);
}

/************/

getLatestEventsTile("Transfer", conn.writeTransferEvent);
getLatestEventsTile("ColorBytesUpdated", conn.writeColorBytesUpdatedEvent);
getLatestEventsTile("Reserved", conn.writeReservedEvent);


function getLatestEventsTile(name, writeEvent) {
    conn.selectLatestBlock(defaultBlock, function (latestBlock) {
        tile.getPastEvents(name, {
            fromBlock: latestBlock + 1,
            toBlock: "latest"
        }, function (err, events) {
            if (err) {
                console.log(err);
            }
            if (events) {
                console.log("Got past events for " + name);
                console.log(events);
                events.forEach(event => writeEvent(event));
            }
        });
    });
}

tile.events.Transfer(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeTransferEvent(event);
    }
});

tile.events.ColorBytesUpdated(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeColorBytesUpdatedEvent(event);
    }
});

tile.events.Reserved(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeReservedEvent(event);
    }
});

// const getTile = (sectionId, fn) => {
//     let addr1 = "0xBcA5f7e36a74Cc6a5bC1AA30A8Ec8d8E7D54BAC6";
//     console.log("getting section: " + sectionId);
//     let sectionMethod = tile.methods.tokenURI(sectionId);
//     sectionMethod.call({ from: addr1 }, function (err, result) {
//         if (err) {
//             throw new Error(err);
//         } else {
//             fn(result);
//         }
//     });
// }

// getTile(48, function(result) {
//     console.log(result);
// })