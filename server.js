var mongoose = require('./app/config/mongoose.js');
var express = require('./app/config/express.js');

var db = mongoose();
var app = express();
var redis = require('redis');
client = redis.createClient(); //creates a new client
client.on('connect', function() {});

app.listen(3000);
module.exports = app;

console.log('=========================================');
console.log('Server running at ' + config.api_url);
console.log('Running in: ' + process.env.NODE_ENV + ' mode.');
console.log('=========================================');