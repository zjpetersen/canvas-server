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

const selectSection = (sectionId, fn) => {
	if (isNaN(sectionId)) {
		throw new Error("sectionId must be a number");
	}
	conn.query("SELECT * from sections WHERE sectionId = " + sectionId, function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

const selectAllSections = (fn) => {
	conn.query("SELECT * from sections ORDER BY sectionId ASC", function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

const selectSectionOffers = (sectionId, fn) => {
	if (isNaN(sectionId)) {
		throw new Error("sectionId must be a number");
	}
	conn.query("SELECT * from offers WHERE sectionId = " + sectionId, function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);
		}
	});
}

const selectAllOffers = (fn) => {
	conn.query("SELECT * from offers ORDER BY sectionId ASC", function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);
		}
	});
}

const writeSectionPurchasedEvent = (event) => {  
  const query = "UPDATE sections SET owner = '" + event.returnValues.buyer + "', ask = 0, updatedColor=false, hasOwner=true WHERE sectionId = " + event.returnValues.sectionId + ";";
  writeToDB(query);
}

const writeAskUpdatedEvent = (event) => {  
  const query = "UPDATE sections SET ask = " + event.returnValues.ask + " WHERE sectionId = " + event.returnValues.sectionId + ";";
  writeToDB(query);
}

const writeColorBytesUpdatedEvent = (event) => {  
  const query = "UPDATE sections SET updatedColor=true, color='" + event.returnValues.updatedColor + "' WHERE sectionId = " + event.returnValues.sectionId + ";";
  writeToDB(query);
  console.log(query);
}

const writeOffersUpdatedEvent = (event) => {  
	const offer = event.returnValues.offer;
	//Delete if offer is 0
	if (offer === 0) {
		const query = "DELETE FROM offers WHERE sectionId = " + event.returnValues.sectionId + " AND offerer = '" + event.returnValues.offerer + "' AND globalOffer = " + event.returnValues.globalOffer + ";";
		writeToDB(query);
	} else {
		const query = "INSERT INTO offers (sectionId, offerer, offer, globalOffer) VALUES (" + event.returnValues.sectionId + ",'" + event.returnValues.offerer + "', '" + event.returnValues.offer + "'," + event.returnValues.globalOffer + ");";
		writeToDB(query);
	}
}

const writeToDB = (query) => {
  console.log(query);
  conn.query(query, function (err, result) {
     if (err) {
       console.log(err);
     } else {
       console.log("Wrote event to the db with values: " + result);
     }
  });

}

exports.selectSection = selectSection;
exports.selectAllSections = selectAllSections;
exports.selectSectionOffers = selectSectionOffers;
exports.selectAllOffers = selectAllOffers;
exports.writeSectionPurchasedEvent = writeSectionPurchasedEvent;
exports.writeAskUpdatedEvent = writeAskUpdatedEvent;
exports.writeColorBytesUpdatedEvent = writeColorBytesUpdatedEvent;
exports.writeOffersUpdatedEvent = writeOffersUpdatedEvent;