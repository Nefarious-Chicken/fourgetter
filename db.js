var mysql = require('mysql');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('datedb', 'root', 'password');

var Category = sequelize.define('Category', {
  categoryFoursquareId: {
    type: Sequelize.STRING,
    unique: true
  },
  categoryName: Sequelize.STRING
});

// var Event = sequelize.define('Event', {

// });

var EventsCategoriesJoin = sequelize.define('EventsCategoriesJoin', {
  event_ID: Sequelize.INTEGER,
  category_ID: Sequelize.INTEGER
});

exports.bulkInsertToDb = function(table, arrayToAdd) {
  sequelize.sync().then(function() {
    return Category.bulkCreate(arrayToAdd, { ignoreDuplicates: true });
  }).then(function(addedObject) {
    console.log("Successfully bulk added to table!");
  });
};

// Event.belongsToMany(Category, {through: EventsCategoriesJoin});
// Category.belongsToMany(Event, {through: EventsCategoriesJoin});
