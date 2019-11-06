var mongoose = require('mongoose');
config = require('./config.js'),


module.exports = function() {

    var db = mongoose.connect(config.db);
    require('../models/feed.server.model');
    require('../models/feedItems.server.model');
    return db;

};