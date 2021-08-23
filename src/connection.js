// import connectionProps from './connectionProps.js';
// const connectionProps = require('./connectionProps.js');
const canvasUtils = require('./canvasUtils.js');

const mysql = require('mysql');  

let conn = mysql.createConnection({  
	host: process.env.RDS_HOSTNAME,  
	user: process.env.RDS_USERNAME,  
	password: process.env.RDS_PASSWORD,  
	database: process.env.RDS_DATABASE
});
// let color = "0x89504e470d0a1a0a0000000d49484452000000100000001008060000001ff3ff61000000017352474200aece1ce90000009749444154388d638cce7bf89f818181e1f8a660067460e9b716ab384c8e81818181099fe6271727c315a203981e265c3610038e6f0a86b8009bed1cba720c0c0c0c785dc1c0c080dd0052008601c8b6c3003e5750d705d86c27e40aeabae0f8a660861f971f615528a39f8b35bd503f16b0b90297edb47101ba2bf0d9cec0c0c0c0842f991202967e6b212ec066c8f14dc1786d87e90100cf0141c9852e14480000000049454e44ae426082";
// let color = "0x72020000e0a50100100010002000010000006400000000000000000000000000200001010000000010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f2010000faf10500640000000500000016000000072001000000000000000000000000000000da000000192020000000000000001f00000000000000000000000000000000ff0000222034ff000045283cff0000663931ff00008f563bff0000df7126ff0000d9a066ff0000eec39aff0000fbf236ff000099e550ff00006abe30ff000037946eff00004b692fff0000524b24ff0000323c39ff00003f3f74ff0000306082ff00005b6ee1ff0000639bffff00005fcde4ff0000cbdbfcff0000ffffffff00009badb7ff0000847e87ff0000696a6aff0000595652ff000076428aff0000ac3232ff0000d95763ff0000d77bbaff00008f974aff00008a6f30ff6a00000004000100002000000022203445283c6639318f563bdf7126d9a066eec39afbf23699e5506abe3037946e4b692f524b24323c393f3f743060825b6ee1639bff5fcde4cbdbfcffffff9badb7847e87696a6a59565276428aac3232d95763d77bba8f974a8a6f301f0000000420030000000000000000000000ff00000007004c617965722030690000000520000000000000ff0200000000000000000f000f00789c6360c00dd61819fdc7238d575f6656d67f72f493ab17a60f8649d14fae5e647de86c5ae9c5e65662dd4eae5e7475d8f4e2d28f4d1d368cae17973e7ce2a4da89ae97547dc8fa29c100d0521364";
// let color2 = "0x89504e470d0a1a0a0000000d49484452000000100000001008060000001ff3ff61000000017352474200aece1ce9000000a949444154388d63b4b72ff9cf400160616060605089e9264bf39d25a510039005908176fd1e0606060686ab8d2e28e2c81632216b26c6252a31dd281631214b1232045d338601f80cc1a619ab01d80cc1a5998181011188b000430043388b5dd99041bb1e55f6e75d3c2e2005c05d802daad8950da1b69dc7f0824a0c1e17a0fb195fec6018802bc07019826200bed0c66508dc00429a7119829217d04d8745152cc0b001464ab3330000634cf8c00b9b9f0000000049454e44ae426082";


// canvasUtils.checkColorValidity(color2);
// canvasUtils.storeImage(color, 5401);



conn.connect(function(err) {
	if (err) {
		console.log("Error while connecting");
		// throw err;
	}
	console.log("Connected!");
});

const selectTile = (tileId, fn) => {
	if (isNaN(tileId)) {
		throw new Error("tileId must be a number");
	}
	conn.query("SELECT * from tiles WHERE tileId = " + tileId, function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

const selectAllTiles = (fn) => {
	conn.query("SELECT * from tiles ORDER BY tileId ASC", function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

const selectTileOffers = (tileId, fn) => {
	if (isNaN(tileId)) {
		throw new Error("tileId must be a number");
	}
	conn.query("SELECT * from offers WHERE tileId = " + tileId, function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);
		}
	});
}

const selectAllOffers = (fn) => {
	conn.query("SELECT * from offers ORDER BY tileId ASC", function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);
		}
	});
}

const selectLatestBlock = (fn) => {
	conn.query("select blockNum from event_cache ORDER BY blockNum DESC LIMIT 1", function (err, result) {
		if (err) {
			console.log(err);
		} else if (result[0]) {
				fn(result[0].blockNum);
		}
	});
}

const writeTransferEvent = (event) => {  
  const query = "UPDATE tiles SET owner = '" + event.returnValues.to + "', ask = 0, updatedColor=false, hasOwner=true WHERE tileId = " + event.returnValues.tokenId + ";";
  writeToDB(query, event);
}

const writeAskUpdatedEvent = (event) => {  
  const query = "UPDATE tiles SET ask = " + event.returnValues.ask + " WHERE tileId = " + event.returnValues.tokenId + ";";
  writeToDB(query, event);
}

const writeColorBytesUpdatedEvent = (event) => {  
  let result = canvasUtils.checkColorValidity(event.returnValues.updatedColor);
	let query;
	if (result) {
		//Stores image in file system, and if successful updates the DB
		canvasUtils.storeImage(event.returnValues.updatedColor, event.returnValues.tokenId, function() {
  			query = "UPDATE tiles SET updatedColor=true, invalidColor=false, color='" + event.returnValues.updatedColor + "' WHERE tileId = " + event.returnValues.tokenId + ";";
  			writeToDB(query, event);
		});
	} else {
  		query = "UPDATE tiles SET updatedColor=true, invalidColor=true, color='" + "0x" + "' WHERE tileId = " + event.returnValues.tokenId + ";";
  		writeToDB(query, event);
	}
}

const writeOffersUpdatedEvent = (event) => {  
	const offer = event.returnValues.offer;
	//Delete if offer is 0
	if (offer === '0') {
		const query = "DELETE FROM offers WHERE tileId = " + event.returnValues.tileId + " AND offerer = '" + event.returnValues.offerer + "' AND globalOffer = " + event.returnValues.globalOffer + ";";
		writeToDB(query, event);
	} else {
		const query = "INSERT INTO offers (tileId, offerer, offer, globalOffer) VALUES (" + event.returnValues.tokenId + ",'" + event.returnValues.offerer + "', '" + event.returnValues.offer + "'," + event.returnValues.globalOffer + ");";
		writeToDB(query, event);
	}
}

const writeToDB = (query, event) => {
  console.log(query);
  conn.query(query, function (err, result) {
     if (err) {
       console.log(err);
     } else {
       console.log("Wrote event to the db with values: " + result);
     }
  });

  let eventQuery = "INSERT INTO event_cache (`txHash`, `logIndex`, `blockNum`, `event`, `tileId`, `address`) VALUES ('" + event.transactionHash + "'," + event.logIndex + "," + event.blockNumber + ",'" + event.event + "'," +  event.returnValues.tokenId + ",'" + event.address + "')"; 
  console.log(eventQuery);
  conn.query(eventQuery, function(err, result) {
	  if (err) {
		  console.log(err);
	  } else {
		  console.log("Wrote event to event cache.");
	  }
  })
}

exports.selectTile = selectTile;
exports.selectAllTiles = selectAllTiles;
exports.selectTileOffers = selectTileOffers;
exports.selectAllOffers = selectAllOffers;
exports.writeTransferEvent = writeTransferEvent;
exports.writeAskUpdatedEvent = writeAskUpdatedEvent;
exports.writeColorBytesUpdatedEvent = writeColorBytesUpdatedEvent;
exports.writeOffersUpdatedEvent = writeOffersUpdatedEvent;
exports.selectLatestBlock = selectLatestBlock;