const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const image = require('get-image-data');
const dominant = require('huey/dominant');
const palette = require('huey/palette');
require('dotenv').config()

const recognize = require('./src/ibmWatson');
const SuggestionAI = require('./src/suggestion');

const checkDominant = (path) => {
  return new Promise((resolve, reject) => {
    image(path, async function (error, img) {
      if (error) {
        reject(error);
      } else {
        resolve(dominant(img.data));
      }
    })
  })
}

const ai = new SuggestionAI();
ai.init();

var imageCounter = 0;
mongoose.connect('mongodb://localhost:27017/auto-wardrobe', { useNewUrlParser: true });
const upload = multer({
  dest: path.join(__dirname, 'assets', 'temp')
});

var app = express();

app.set('view engine', 'hbs');

app.use(serveStatic(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));
/*
{
type: 'upper'/'lower'/'full',
name: 'tshirt',
color: 'black',
weather: 'winter',
imagePath: './pic/clothing1.png'
}
*/

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to mongodb');
  app.listen(8080, () => {
    console.log('listening on port 8080');
  });
});

var clothingSchema = new mongoose.Schema({
  name: String,
  type: String,
  color: Object,
  weather: String,
  path: String
});

var Clothing = mongoose.model('Clothing', clothingSchema);

// const handleError = (err, res) => {
//   console.error(err);
//   res
//   .status(500)
//   .contentType('text/plain')
//   .end('Oops! Something went wrong!');
// };

app.get('/', (req, res) => {
  if (req.query && req.query.errorUpload == 'true') {
    res.render('index', { errorUpload: true, errorMessage: `${req.query.errorMessage}.`});
  } else if (req.query && req.query.successUpload == 'true') {
    res.render('index', { successUpload: true });
  } else {
    res.render('index');
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findList(type, weather) {
  return new Promise((resolve, reject) => {
    Clothing.find({type: type, weather: weather}, function (err, docs) {
      var outterResult = docs;
      Clothing.find({type: type, weather: 'all'}, function (err, docs) {
        if (outterResult.concat(docs).length <= 0) {
          resolve([]);
        }
        resolve(outterResult.concat(docs));
      });
    });
  });
}

async function findBestMatch(up, lowList, cb) {
  if (up.type == 'full') {
    cb('full');
  } else if (lowList.length <= 0) {
    cb('full');
  } else {
    var bestMatch = lowList[0];
    var bestScore = 0;
    for (const low of lowList) {
      var result = await ai.suggest({r: up.color.r, g: up.color.g, b: up.color.b, r2: low.color.r, g2: low.color.g, b2: low.color.b});
      var score = result.good - result.bad;
      if (score > bestScore) {
        bestMatch = low;
      }
    }
    cb(bestMatch);
  }
}

app.get('/generateSF', async (req, res) => {
  var upList = [];
  var lowList = [];
  var up = {};
  var low = {};
  findList('up', 'spring/fall').then((result) => {
    upList = upList.concat(result);
    return findList('full', 'spring/fall');
  }).then((result) => {
    upList = upList.concat(result);
    var index = getRandomInt(0, upList.length - 1);
    up = upList[index];
    return findList('low', 'spring/fall');
  }).then((result) => {
    lowList = result;
    console.log(lowList);
    findBestMatch(up, lowList, (result) => {
      if (result == 'full') {
        res.render('suggestion', {fullBody: true, fullPath: up.path, ownPath: '/generateSF'});
      } else {
        console.log(result);
        console.log(up);
        res.render('suggestion', {fullBody: false, upPath: up.path, lowPath: result.path, ownPath: '/generateSF'});
      }
    });
  }).catch(err => {
    console.error(err);
  });
});

app.get('/generateSU', (req, res) => {
  var upList = [];
  var lowList = [];
  var up = {};
  var low = {};
  findList('up', 'summer').then((result) => {
    upList = upList.concat(result);
    return findList('full', 'summer');
  }).then((result) => {
    upList = upList.concat(result);
    var index = getRandomInt(0, upList.length - 1);
    up = upList[index];
    return findList('low', 'summer');
  }).then((result) => {
    lowList = result;
    findBestMatch(up, lowList, (result) => {
      if (result == 'full') {
        res.render('suggestion', {fullBody: true, fullPath: up.path, ownPath: '/generateSU'});
      } else {
        // console.log(result);
        // console.log(up);
        res.render('suggestion', {fullBody: false, upPath: up.path, lowPath: result.path, ownPath: '/generateSU'});
      }
    });
  }).catch(err => {
    console.error(err);
  });
});

app.get('/generateWI', (req, res) => {
  var upList = [];
  var lowList = [];
  var up = {};
  var low = {};
  findList('up', 'winter').then((result) => {
    upList = upList.concat(result);
    return findList('full', 'winter');
  }).then((result) => {
    upList = upList.concat(result);
    var index = getRandomInt(0, upList.length - 1);
    up = upList[index];
    return findList('low', 'winter');
  }).then((result) => {
    lowList = result;
    findBestMatch(up, lowList, (result) => {
      if (result == 'full') {
        console.log(result);
        res.render('suggestion', {fullBody: true, fullPath: up.path, ownPath: '/generateWI'});
      } else {
        console.log(result);
        console.log(up);
        res.render('suggestion', {fullBody: false, upPath: up.path, lowPath: result.path, ownPath: '/generateWI'});
      }
    });
  }).catch(err => {
    console.error(err);
  });
});

app.get('/generateFL', (req, res) => {
  var fullList = [];
  findList('full', 'formal').then((result) => {
    fullList = fullList.concat(result);
    var index = getRandomInt(0, fullList.length - 1);
    var full = fullList[index];
    if (!full) {
      res.redirect('/');
    }
    res.render('suggestion', {fullBody: true, fullPath: full.path, ownPath: '/generateFL'});
  }).catch(err => {
    console.error(err);
  });
});

// var TShirt = new Clothing({ type: 'TShirt', color: 'Black', imagePath: './pic/clothing1.png'});
// TShirt.save(function (err, cloth) {
//   if (err) return console.error(err);
//   console.log(cloth);
// });

const saveDB = (clothItem) => {
  return new Promise((resolve, reject) => {
    var newCloth = new Clothing(clothItem);
    newCloth.save((err, cloth) => {
      if (err) reject(err);
      else resolve(cloth);
    })
  });
}

app.post('/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.redirect('/?errorUpload=true&errorMessage=Please select a file');
  } else {
    var clothItem = {};
    const tempPath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.join(__dirname, 'assets', 'wardrobe', `i${imageCounter}${fileType}`);
    const savePath = `/wardrobe/i${imageCounter}${fileType}`;
    fs.rename(tempPath, targetPath, err => {
      if (err) return console.error(err);
      imageCounter += 1;
      clothItem.path = savePath;
      checkDominant(targetPath).then((result) => {
        // console.log('passed 2');
        clothItem.color = {r:result[0]/255, g:result[1]/255, b:result[2]/255};
        return recognize(targetPath);
      }).then((result) => {
        clothItem.name = result.name;
        clothItem.weather = result.weather;
        clothItem.type = result.type;
        return saveDB(clothItem);
      }).then((result) => {
        // res.send(JSON.stringify(result));
        // console.log(result);
        res.redirect('/?successUpload=true');
      }).catch((err) => {
        console.error(err);
      });
    });

  }
}));
