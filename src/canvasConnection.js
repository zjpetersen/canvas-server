const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');


/*** Code to load canvas smart contract ***/
console.log("getting connection");
let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
console.log("getting canvas");

let pathMosaic = "../canvas/client/src/contracts/MosaicMarket.json";
let abiMosaic = JSON.parse(fs.readFileSync(pathMosaic, 'utf8')).abi;
let mosaicAddr; //Can get from truffle migration output

let pathTile = "../canvas/client/src/contracts/MosaicTiles.json";
let abiTile = JSON.parse(fs.readFileSync(pathTile, 'utf8')).abi;
let tileAddr; //Can get from truffle migration output
// let addr1 = '0xc47BA58918D4AA2614ce5C052De64f7b3D89F820';
readContractAddresses();

let canvas = new web3.eth.Contract(abiMosaic, mosaicAddr);
let tile = new web3.eth.Contract(abiTile, tileAddr);
console.log("got canvas!");

function readContractAddresses() {
    let data = fs.readFileSync('src/contractAddresses.txt');
    let addr = data.toString().split(',');
    tileAddr = addr[0];
    mosaicAddr = addr[1];
    console.log(tileAddr);
    console.log(mosaicAddr);
}

/************/

getLatestEventsTile("Transfer", conn.writeTransferEvent);
getLatestEventsTile("ColorBytesUpdated", conn.writeColorBytesUpdatedEvent);


function getLatestEventsTile(name, writeEvent) {
    conn.selectLatestBlock(function (latestBlock) {
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

canvas.events.AskUpdated(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeAskUpdatedEvent(event);
    }
});

tile.events.ColorBytesUpdated(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeColorBytesUpdatedEvent(event);
    }
});

canvas.events.OffersUpdated(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        conn.writeOffersUpdatedEvent(event);
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