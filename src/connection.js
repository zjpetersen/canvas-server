// import connectionProps from './connectionProps.js';
const connectionProps = require('./connectionProps.js');

const mysql = require('mysql');  
let conn = mysql.createConnection({  
	host: connectionProps.host,  
	user: connectionProps.user,  
	password: connectionProps.password,  
	database: connectionProps.database
});


conn.connect(function(err) {
	if (err) {
		console.log("Error while connecting");
		throw err;
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
  const query = "UPDATE tiles SET updatedColor=true, color='" + event.returnValues.updatedColor + "' WHERE tileId = " + event.returnValues.tokenId + ";";
  writeToDB(query, event);
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