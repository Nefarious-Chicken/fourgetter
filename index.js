var express = require('express');
var request = require('request');
// Middleware
var morgan = require('morgan');
var parser = require('body-parser');
var db = require('./db');

var app = express();
module.exports.app = app;

// Set what we are listening on.
app.set("port", 8000);

// Logging and parsing
app.use(morgan('dev'));
app.use(parser.json());

var clientID = PUT_CLIENTID_HERE;
var clientSecret = PUT_CLIENTSECRET_HERE;

var foursquare = require('node-foursquare-venues')(clientID, clientSecret);

var grabData = function(searchObj) {
  foursquare.venues.search(searchObj, function(err, result) {
    if (err) {
      console.log("There was an error!");
    } else {
      console.log("Here is the result!",  result.response.venues);
      var venues = result.response.venues;
      for (var i = 0; i < venues.length; i++) {
        console.log(venues[i].name);
      }
    }
  })
};

var grabCategories = function(callback) {
  var categoriesToPutInDb = [];
  foursquare.venues.categories(function(err, result) {
    if (err) {
      console.log("There was an error getting the categories", err);
    } else {
      // console.log(result.response.categories);
      var cats = result.response.categories;
      for (var i = 0; i < cats.length; i++) {
        var categoryObject = {
          categoryFoursquareId: cats[i].id,
          categoryName: cats[i].name
        };
        categoriesToPutInDb.push(categoryObject);
        if (cats[i].hasOwnProperty('categories')) {
          var subcats = cats[i].categories;
          for (var k = 0; k < subcats.length; k++) {
            var subcatObject = {
              categoryFoursquareId: subcats[k].id,
              categoryName: subcats[k].name
            };
            categoriesToPutInDb.push(subcatObject);
          }
        }
      }
    }
    callback(categoriesToPutInDb);
  });
}

app.get('/seed/categories', function(req, res) {
  grabCategories(function(categories) {
    db.bulkInsertToDb('Categories', categories);
    res.send("Added all the categories to the database!");
  });
});

app.get('/grab/:category', function(req, res) {
  var searchObj = {
    ll: '37.78,-122.41',
    categoryId: '4d4b7104d754a06370d81259',
    intent: 'browse',
    radius: '4000'
  };
  grabData(searchObj);
});

// If we are being run directly, run the server.
if (!module.parent) {
  app.listen(app.get("port"));
  console.log("Listening on", app.get("port"));
}



// grab just the ID and or the name... maybe also the category id, location data?? i guess we'll ask for that live. 
// from foursquare, when it was last updated. 