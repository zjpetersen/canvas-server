var express = require('express');
var router = express.Router();
const conn = require('../src/connection.js');
const canvasUtils = require('../src/canvasUtils.js');

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

router.get('/tile/metadata/:tileId', function(req, res, next) {
  const tileId = req.params["tileId"];
  if (!tileId || isNaN(tileId) || tileId < 0 || tileId >= 7056 ) {
    throw new Error("Invalid tile id: " + tileId);
  }
  const hostWithPort = process.env.HOST_NAME + ":" + process.env.NODE_PORT;
  const url = hostWithPort + "/canvas/"; //TODO make it so if we add /<tokenId>/ it will route correctly

  let obj = new Object();
  obj.description =  "Tile for the Mosaic contract, Dismos.";
  obj.external_url = url; //TODO make it so if we add /<tokenId>/ it will route correctly
  obj.name  = "Tile " + tileId;

  conn.selectTile(tileId, function(queryResult) {
    if (!queryResult[0].invalidColor) {
      let color = queryResult[0].color.toString('utf8');
	    color =color.substring(2, color.length);
	    let img = Buffer.from(color, 'hex');
      obj.image = hostWithPort + "/images/image_" + tileId + "." + canvasUtils.getImageDataType(img.toString('base64'));
    } else {
      obj.image = hostWithPort + "/images/EthereumLogoSmall.png";
    }
    res.json(obj);
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
