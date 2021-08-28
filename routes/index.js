var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../src/connection.js');
const canvasUtils = require('../src/canvasUtils.js');
const cache = require('../src/cache.js');
const emailClient = require('../src/emailClient.js');

let app = express();

app.use(bodyParser.json());

//TODO delete this
// router.get('/tile/:tileId', function(req, res, next) {
//   const tileId = req.params["tileId"];
//   if (!tileId || isNaN(tileId) || tileId < 0 || tileId >= 7056 ) {
//     res.status(400).send("Invalid tile id: " + tileId);
//   } else {


//     conn.selectTile(tileId, function (queryResult) {
//       queryResult[0].color = queryResult[0].color.toString('utf8');
//       res.json(queryResult);
//     });
//   }
// });

router.get('/tile/metadata/:tileId', function(req, res, next) {
  const tileId = req.params["tileId"];
  if (!tileId || isNaN(tileId) || tileId < 0 || tileId >= 7056 ) {
    // throw new Error("Invalid tile id: " + tileId);
    res.status(400).send("Invalid tile id: " + tileId);
  } else {
    const hostWithPort = process.env.HOST_NAME + ":" + process.env.NODE_PORT;
    const url = hostWithPort + "/canvas/"; //TODO make it so if we add /<tokenId>/ it will route correctly

    let obj = new Object();
    obj.description = "Tile for the Mosaic contract, Dismos.";
    obj.external_url = url; //TODO make it so if we add /<tokenId>/ it will route correctly
    obj.name = "Tile " + tileId;

    conn.selectTile(tileId, function (queryResult) {
      if (!queryResult[0].invalidColor) {
        let color = queryResult[0].color.toString('utf8');
        color = color.substring(2, color.length);
        let img = Buffer.from(color, 'hex');
        obj.image = hostWithPort + "/images/image_" + tileId + "." + canvasUtils.getImageDataType(img.toString('base64'));
      } else {
        obj.image = hostWithPort + "/images/EthereumLogoSmall.png";
      }
      res.json(obj);
    });
  }
});

router.get('/tiles', function(req, res, next) {
  if (!req.headers['tile-check']) {
    res.redirect('/');
  } else {
    let currTime = Date.now();
    res.json(cache.getTileCache());
    let ms = Date.now() - currTime;
    console.log("Request took: " + ms);

    // conn.selectAllTiles(function (queryResult) {
    //   for (let i = 0; i < queryResult.length; i++) {
    //     queryResult[i].color = queryResult[i].color.toString('utf8');
    //   }
    //   res.json(queryResult);
    // let ms = Date.now() - currTime;
    // console.log("Request took: " + ms);
    // });
  }
});

router.post('/email', function(req, res, next) {
  if (!req.body) {
    res.status(400).send("Invalid email");
  } else {

    console.log(req.body);
    console.log(req.body.email);
    conn.addEmail(req.body.email, function(queryResult, duplicateEmail, rand) {
      console.log("Result time");
      console.log(queryResult);
      if (duplicateEmail) {
        //Still send a successful response on duplicate, so users identity isn't compromised
        res.send("Got an email!");
      } else if (queryResult) {
        // emailClient.writeVerificationEmail(req.body.email, rand, function(result) {
        //   if (result) {
            res.send("Got an email!");
          // } else {
          //   res.status(500).send("Error sending verification email");
          // }
        // })

      } else {
        res.status(500).send("Error saving to the db");
      }
    });
  }
});

router.get('/email/:hash', function(req, res, next) { //TODO post?
    const hash = req.params["hash"];
    if (!hash) {
      res.status(500).send("Email id required");
    }
    console.log("Got hash of : " + hash);
    res.send("Got hash of : " + hash);
});

router.get('/*', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
