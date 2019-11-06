if (process.env.NODE_ENV) {
    module.exports = require('./env/' + process.env.NODE_ENV + '.js');
} else {
    console.log("===================================================================");
    console.log('Command Is -> "$NODE_ENV=dev node server.js"');
    console.log("===================================================================");
    process.exit();
}