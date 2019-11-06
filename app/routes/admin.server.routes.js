var adminCtrl = require('../controllers/admin.server.controller.js');

module.exports = function(app) {

    app.route('/api/v1.0/admin/feed/seed').get(adminCtrl.seedFeeds);
    app.route('/api/v1.0/admin/feed/delete').get(adminCtrl.deleteFeeds);
    app.route('/api/v1.0/admin/feed/item/delete').get(adminCtrl.deleteFeedItems);
    app.route('/api/v1.0/admin/feed/scrapeUrlTest').get(adminCtrl.scrapeUrl);
};
