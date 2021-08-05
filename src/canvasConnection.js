const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');

/*** Code to load canvas smart contract ***/
console.log("getting connection");
let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
console.log("getting canvas");

let pathMosaic = "../canvas/client/src/contracts/MosaicMarket.json";
let abiMosaic = JSON.parse(fs.readFileSync(pathMosaic, 'utf8')).abi;
let mosaicAddr = "0xB04C15261ad404dB6467C3b6C85B5c5b2a5b5eFA"; //Can get from truffle migration output

let pathTile = "../canvas/client/src/contracts/Tile.json";
let abiTile = JSON.parse(fs.readFileSync(pathTile, 'utf8')).abi;
let tileAddr = "0x784f747b7a926Ccd874ec00E85E099d4e0D2ef40"; //Can get from truffle migration output
// let addr1 = '0xc47BA58918D4AA2614ce5C052De64f7b3D89F820';

let canvas = new web3.eth.Contract(abiMosaic, mosaicAddr);
let tile = new web3.eth.Contract(abiTile, tileAddr);
console.log("got canvas!");
/************/

getLatestEventsTile("Transfer", conn.writeTransferEvent);
getLatestEvents("AskUpdated", conn.writeAskUpdatedEvent);
getLatestEvents("ColorBytesUpdated", conn.writeColorBytesUpdatedEvent);
getLatestEvents("OffersUpdated", conn.writeOffersUpdatedEvent);

function getLatestEvents(name, writeEvent) {
    conn.selectLatestBlock(function (latestBlock) {
        canvas.getPastEvents(name, {
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
        // console.log("Got event.");
        // console.log(event);
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

canvas.events.ColorBytesUpdated(function(err, event) {
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
