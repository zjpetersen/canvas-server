var express = require('express');
var router = express.Router();
const conn = require('../src/connection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({"basic": "json"});
});


router.get('/tile/:tileId', function(req, res, next) {
  const tileId = req.params["tileId"];
  if (!tileId || isNaN(tileId) || tileId < 0 || tileId >= 7056 ) {
    throw new Error("Invalid tile id: " + tileId);
  }

  conn.selectTile(tileId, function(queryResult) {
    queryResult[0].color = queryResult[0].color.toString('utf8');
    res.json(queryResult);
  });
});

router.get('/tiles', function(req, res, next) {
  conn.selectAllTiles(function(queryResult) {
    for (let i = 0; i < queryResult.length; i++) {
      queryResult[i].color = queryResult[i].color.toString('utf8');
    }
    res.json(queryResult);
  });
});

router.get('/offers/:tileId', function(req, res, next) {
  const tileId = req.params["tileId"];
  if (!tileId || isNaN(tileId) || tileId < 0 || tileId >= 7056 ) {
    throw new Error("Invalid tile id: " + tileId);
  }

  conn.selectTileOffers(tileId, function(queryResult) {
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
