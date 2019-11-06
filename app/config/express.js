 var express = require('express');

 module.exports = function() {
     var app = express();

     app.all('*', function(req, res, next) {
       res.header('Access-Control-Allow-Origin', '*');
       res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
       res.header('Access-Control-Allow-Headers', 'Content-Type');
       next();
     });

     require('../routes/index.server.routes.js')(app);
     require('../routes/api.server.routes.js')(app);
     require('../routes/admin.server.routes.js')(app);
     return app;
 };
