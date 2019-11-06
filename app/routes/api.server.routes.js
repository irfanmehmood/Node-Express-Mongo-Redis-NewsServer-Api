var apiCtrl = require('../controllers/api.server.controller.js');

module.exports = function(app) {

    app.route('/api/v1.0/feed/listFeeds').get(apiCtrl.listFeeds);
    app.route('/api/v1.0/feed/items/list').get(apiCtrl.listFeedItems);
    app.route('/api/v1.0/feed/listFeedItemsBySource/:slug').get(apiCtrl.listFeedItemsBySource);
    app.route('/api/v1.0/feed/listFeedItemsBySourceAndCategory/:companySlug/:category/:pageNo').get(apiCtrl.listFeedItemsBySourceAndCategory);
    app.route('/api/v1.0/feed/list/source/:slug').get(apiCtrl.listFeedsBySource);
    app.route('/api/v1.0/feed/listCategoriesBySource/:slug').get(apiCtrl.listCategoriesBySource);
    app.route('/api/v1.0/feed/listSourcesByCategory/:category').get(apiCtrl.listSourcesByCategory);
    app.route('/api/v1.0/feed/listKeyWordsByDate/:date').get(apiCtrl.listKeyWordsByDate);
    app.route('/api/v1.0/feed/listKeyWordsBetweenDates/:stdate/:eddate').get(apiCtrl.listKeyWordsBetweenDates);
    app.route('/api/v1.0/feed/listFeedItemsByCategory/:category').get(apiCtrl.listFeedItemsByCategory);
    app.route('/api/v1.0/feed/item/searchFeedItems/:term/:pageNo').get(apiCtrl.searchFeedItems);
    app.route('/api/v1.0/feed/item/id/:id').get(apiCtrl.getFeedItem);
    app.route('/api/v1.0/feed/items/list/category/:category').get(apiCtrl.listFeedItemsByCategory);
    app.route('/api/v1.0/feed/listFeedCategories').get(apiCtrl.listFeedCategories);
    app.route('/api/v1.0/feed/listFeedSources').get(apiCtrl.listFeedSources);
    app.route('/api/v1.0/feed/items/latestnews').get(apiCtrl.getLatestNews);
    app.route('/api/v1.0/feed/items/headlinenews').get(apiCtrl.getHeadlineNews);
    app.route('/api/v1.0/feed/items/dashboardNews').get(apiCtrl.getDashboardSourceNewsList);

};