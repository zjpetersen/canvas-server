var express = require('express');
var router = express.Router();
const conn = require('../src/connection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({"basic": "json"});
});


router.get('/section/:sectionId', function(req, res, next) {
  const sectionId = req.params["sectionId"];
  if (!sectionId || isNaN(sectionId) || sectionId < 0 || sectionId >= 7056 ) {
    throw new Error("Invalid section id: " + sectionId);
  }

  conn.selectSection(sectionId, function(queryResult) {
    console.log(queryResult)
    res.json(queryResult);
  });
});

router.get('/sections', function(req, res, next) {
  conn.selectAllSections(function(queryResult) {
    console.log(queryResult)
    res.json(queryResult);
  });
});

router.get('/offers/:sectionId', function(req, res, next) {
  const sectionId = req.params["sectionId"];
  if (!sectionId || isNaN(sectionId) || sectionId < 0 || sectionId >= 7056 ) {
    throw new Error("Invalid section id: " + sectionId);
  }

  conn.selectSectionOffers(sectionId, function(queryResult) {
    console.log(queryResult)
    res.json(queryResult);
  });
});

router.get('/offers', function(req, res, next) {
  conn.selectAllOffers(function(queryResult) {
    console.log(queryResult)
    res.json(queryResult);
  });
});

module.exports = router;
