const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');

/*** Code to load canvas smart contract ***/
console.log("getting connection");
let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
console.log("getting canvas");
let path = "../canvas/client/src/contracts/Canvas.json";

let abi = JSON.parse(fs.readFileSync(path, 'utf8')).abi;
let contractAddr = "0xAFDef96c1Ea37874A7C25E7E019757F739dA551D"; //Can get from truffle migration output
// let addr1 = '0xc47BA58918D4AA2614ce5C052De64f7b3D89F820';

let canvas = new web3.eth.Contract(abi, contractAddr);
console.log("got canvas!");
/************/

getLatestEvents("SectionPurchased", conn.writeSectionPurchasedEvent);
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

canvas.events.SectionPurchased(function(err, event) {
    if (err) {
        console.log(err);
    } else {
        // console.log("Got event.");
        // console.log(event);
        conn.writeSectionPurchasedEvent(event);
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

//TODO remove this
// const getSection = (sectionId, fn) => {
//     console.log("getting section: " + sectionId);
//     let sectionMethod = canvas.methods.getSection(sectionId);
//     sectionMethod.call({ from: addr1 }, function (err, result) {
//         if (err) {
//             throw new Error(err);
//         } else {
//             fn(result);
//         }
//     });
// }


// exports.getSection = getSection;