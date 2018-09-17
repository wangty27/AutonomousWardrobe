var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

var visualRecognition = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: process.env.IBM_KEY
});


function convert( clothes ) {
  var up = "up";
  var low = "low";
  var full = "full";
  var nameList = {
    "T-shirt" : {type : up, weather : "summer"},
    shirt: { type : up, weather : "spring/fall"},
    coat: { type : up, weather : "winter"},
    dress: { type : full, weather : "summer"},
    trouser: { type : low, weather : "all"},
    skirt: { type : low, weather : "summer"},
    suit : { type : full, weather : "formal"},
    sweater: { type : up, weather : "winter"}
  }
  var result = nameList[clothes];
  result.name = clothes;
  return result;
}


function recognize(path) {
  var owners = ["IBM"];
  var threshold = 0.6;
  var images_file= fs.createReadStream(path);
  // var images_file = path;

  var params = {
    images_file: images_file,
    owners: owners,
    threshold: threshold
  };

  return new Promise((resolve, reject) => {
    visualRecognition.classify(params, function(err, response) {
      var TypeList = ["T-shirt", "shirt", "coat", "dress", "trouser", "skirt", "suit", "sweater", "suit of clothes"];
      var ColorList = ["white", "black", "red", "green", "blue", "purple", "yellow", "orange", "brown", "gray", "pink", "beige", "maroon", "darkgray", "charcoal"];

      if (err)
      console.log(err);
      else
      var classes = response.images[0].classifiers[0].classes;
      var arrayLength = classes.length;
      var isColorSet = false;
      var isTypeSet = false;
      var colorResult = "white";  // if color doesn't exist in list, default it to white
      var TypeResult = "shirt";  // if type doesn't exist in list, default it to shirt

      for (var i = 0; i < arrayLength; i++) {
        var className = classes[i].class;
        //console.log(className);
        for(var j = 0; j < TypeList.length; j++)  {
          if (className === TypeList[j] && !isTypeSet) {
            if (className === "suit of clothes") {
              TypeResult = 'suit';
            } else {
              TypeResult = className;
            }
            isTypeSet = true;
            break;
          }
        }
      }

      // output type and color
      console.log(TypeResult);
      resolve(convert(TypeResult));
    })
  });
}

module.exports = recognize;
