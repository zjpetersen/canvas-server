const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');


/*** Code to load canvas smart contract ***/
console.log("getting web3 connection");
// let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545"); //TODO infura
let web3;
let pathTile;
let isStageOrProd = process.env.DEPLOYMENT_ENV === "prod" || process.env.DEPLOYMENT_ENV === "test" || process.env.DEPLOYMENT_ENV === "mumbai" || process.env.DEPLOYMENT_ENV === "polygon";
if (process.env.DEPLOYMENT_ENV === "prod") {
    web3 = new Web3("https://mainnet.infura.io/v3" + process.env.INFURA_PROJECT_ID);
    pathTile = "CryptoCanvas.json";
} else if (process.env.DEPLOYMENT_ENV === "test") {
    web3 = new Web3("wss://rinkeby.infura.io/ws/v3/" + process.env.INFURA_PROJECT_ID);
    pathTile = "CryptoCanvas.json";
} else if (process.env.DEPLOYMENT_ENV === "mumbai") {
    // web3 = new Web3("https://polygon-mumbai.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
    web3 = new Web3("wss://speedy-nodes-nyc.moralis.io/" + process.env.MORALIS_PROJECT_ID + "/polygon/mumbai/ws");
    pathTile = "CryptoCanvas_mumbai.json";
    console.log("Connecting to Mumbai");
} else if (process.env.DEPLOYMENT_ENV === "polygon") {
    // web3 = new Web3("https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
    web3 = new Web3("wss://speedy-nodes-nyc.moralis.io/" + process.env.MORALIS_PROJECT_ID + "/polygon/mainnet/ws");
    pathTile = "CryptoCanvas_polygon.json";
} else {
    // web3 = new Web3("wss://rinkeby.infura.io/ws/v3/" + process.env.INFURA_PROJECT_ID);
    web3 = new Web3("ws://localhost:7545");
    pathTile = "CryptoCanvas_local.json";
}

let abiTile = JSON.parse(fs.readFileSync(pathTile, 'utf8')).abi;
let tileAddr; 
let defaultBlock;
readContractAddresses();

let tile = new web3.eth.Contract(abiTile, tileAddr);

function readContractAddresses() {
    if (isStageOrProd) {
        tileAddr = process.env.CONTRACT_ADDRESS;
        defaultBlock = 0;
        console.log("Connected to contract addr: ");
        console.log(tileAddr);
    } else {
        let data = fs.readFileSync('src/contractInfo.config');
        let dataArr = data.toString().split(',');
        tileAddr = dataArr[0];
        defaultBlock = dataArr[1] - 1;
        console.log(tileAddr);
        console.log(defaultBlock);
    }
}

/************/

getLatestEventsTile("Transfer", conn.writeTransferEvent);
getLatestEventsTile("ColorBytesUpdated", conn.writeColorBytesUpdatedEvent);
getLatestEventsTile("ConsecutiveTransfer", conn.writeConsecutiveTransferEvent);


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

tile.events.ConsecutiveTransfer(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeConsecutiveTransferEvent(event);
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