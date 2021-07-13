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
	conn.query("SELECT * from event_cache WHERE sectionId = " + sectionId, function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

const selectAllSections = (fn) => {
	conn.query("SELECT * from event_cache ORDER BY sectionId ASC", function (err, result) {
		if (err) {
			throw new Error(err);
		} else {
			fn(result);

		}
	});
}

exports.selectSection = selectSection;
exports.selectAllSections = selectAllSections;