const Web3 = require('web3');
const fs = require('fs');
const conn = require('./connection.js');

/*** Code to load canvas smart contract ***/
console.log("getting connection");
let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
console.log("getting canvas");
let path = "../canvas/client/src/contracts/Canvas.json";

let abi = JSON.parse(fs.readFileSync(path, 'utf8')).abi;
let contractAddr = "0x2Bf8A4c6836877Ac145B6f12A23d36578aC08261"; //Can get from truffle migration output
let addr1 = '0x895Bf38d96C2B5F45e9E8FAB610a4dE0f19D9249';

let canvas = new web3.eth.Contract(abi, contractAddr);
console.log("got canvas!");
/************/


//TODO handle events when app is not running, add a starting block?
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
const getSection = (sectionId, fn) => {
    console.log("getting section: " + sectionId);
    let sectionMethod = canvas.methods.getSection(sectionId);
    sectionMethod.call({ from: addr1 }, function (err, result) {
        if (err) {
            throw new Error(err);
        } else {
            fn(result);
        }
    });
}


exports.getSection = getSection;