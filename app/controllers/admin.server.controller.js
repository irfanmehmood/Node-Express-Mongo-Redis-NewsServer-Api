var mongoose = require('mongoose'),
    FeedModel = mongoose.model('FeedModel'),
    FeedItemModel = mongoose.model('FeedItemModel');
    var cheerio = require('cheerio');
exports.index = function(req, res) {

    res.send('FeedCtrl: index');

};

exports.deleteFeeds = function(req, res, next) {

    FeedModel.remove({}, function(err) {
            if (err) {
                console.log(err);
            } else {
                res.end('{"success" : "Deleted Successfully", "status" : 200}');
            }
        }
    );
};

exports.deleteFeedItems = function(req, res, next) {

    FeedItemModel.remove({}, function(err) {
            if (err) {
                console.log(err);
                return next(err);
            } else {
                res.end('{"success" : "Deleted Successfully", "status" : 200}');
            }
        }
    );
};

exports.seedFeeds = function(req, res, next) {

    var z = [

        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/rss.xml", "category" : "headlines"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/world/rss.xml", "category" : "world"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/business/rss.xml", "category" : "business"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/health/rss.xml", "category" : "health"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "category" : "science"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/technology/rss.xml", "category" : "technology"},
        {"name":"bbc", "slug":"bbc", "url": "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", "category" : "entertainment"},

        {"name":"cnn", "slug":"cnn", "url": "http://rss.cnn.com/rss/edition.rss", "category" : "headlines"},
        {"name":"cnn", "slug":"cnn", "url": "http://rss.cnn.com/rss/edition_world.rss", "category" : "world"},
        {"name":"cnn", "slug":"cnn", "url": "http://rss.cnn.com/rss/edition_business.rss", "category" : "business"},
        {"name":"cnn", "slug":"cnn", "url": "http://rss.cnn.com/rss/edition_technology.rss", "category" : "technology"},

        {"name":"sky", "slug":"sky", "url": "http://news.sky.com/feeds/rss/home.xml", "category" : "headlines"},
        {"name":"sky", "slug":"sky", "url": "http://news.sky.com/feeds/rss/world.xml", "category" : "world"},
        {"name":"sky", "slug":"sky", "url": "http://news.sky.com/feeds/rss/business.xml", "category" : "business"},
        {"name":"sky", "slug":"sky", "url": "http://news.sky.com/feeds/rss/technology.xml", "category" : "technology"},

        {"name":"rt news", "slug":"rt", "url": "http://rt.com/rss", "category" : "headlines"},
        {"name":"rt news", "slug":"rt", "url": "http://rt.com/rss/business", "category" : "business"},

        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/topNews", "category" : "headlines"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/Reuters/worldNews", "category" : "world"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/businessNews", "category" : "business"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/technologyNews", "category" : "technology"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/scienceNews", "category" : "science"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/environment", "category" : "science"},
        {"name":"reuters", "slug":"reuters", "url": "http://feeds.reuters.com/reuters/healthNews", "category" : "health"},

        {"name":"washington post", "slug":"washington-post", "url": "http://www.washingtonpost.com/wp-dyn/rss/world/index.xml", "category" : "headlines"},
        {"name":"washington post", "slug":"washington-post", "url": "http://www.washingtonpost.com/wp-dyn/rss/business/index.xml", "category" : "business"},
        {"name":"washington post",  "slug":"washington-post","url": "http://www.washingtonpost.com/wp-dyn/rss/technology/index.xml", "category" : "technology"},
        //{"name":"washington post",  "slug":"washington-post","url": "http://www.washingtonpost.com/wp-dyn/rss/nation/science/index.xml", "category" : "science"},
        //{"name":"washington post",  "slug":"washington-post","url": "http://www.washingtonpost.com/wp-dyn/rss/health/index.xml", "category" : "health"},


        {"name":"daily mail",  "slug":"daily-mail","url": "http://www.dailymail.co.uk/home/index.rss", "category" : "headlines"},
        {"name":"daily mail",  "slug":"daily-mail","url": "http://www.dailymail.co.uk/news/headlines/index.rss", "category" : "world"},
        {"name":"daily mail",  "slug":"daily-mail","url": "http://www.dailymail.co.uk/money/market-data.rss", "category" : "business"},
        {"name":"daily mail", "slug":"daily-mail", "url": "http://www.dailymail.co.uk/sciencetech/index.rss", "category" : "science"},
        {"name":"daily mail", "slug":"daily-mail", "url": "http://www.dailymail.co.uk/health/index.rss", "category" : "health"},

        {"name":"aljazeera",  "slug":"aljazeera", "url": "http://www.aljazeera.com/services/rss/?postingid=2007731105943979989", "category" : "headlines"},
    ];

    /*


     array('Station' => 'press tv','Channel' => 'asia','Category' => 'asia','Url' => 'http://edition.presstv.ir/rss/?section=3510204'),
     array('Station' => 'press tv','Channel' => 'africa','Category' => 'africa','Url' => 'http://edition.presstv.ir/rss/?section=3510204'),
     array('Station' => 'press tv','Channel' => 'technology','Category' => 'technology','Url' => 'http://edition.presstv.ir/rss/?section=3510208'),
     array('Station' => 'press tv','Channel' => 'health','Category' => 'health','Url' => 'http://edition.presstv.ir/rss/?section=3510210'),
     array('Station' => 'press tv','Channel' => 'business','Category' => 'business','Url' => 'http://edition.presstv.ir/rss/?section=3510213'),

     array('Station' => 'nasa','Channel' => 'breaking news','Category' => 'top news','Url' => 'http://www.nasa.gov/rss/dyn/breaking_news.rss'),
     array('Station' => 'nasa','Channel' => 'education','Category' => 'space','Url' => 'http://www.nasa.gov/rss/dyn/educationnews.rss'),
     */

    var pressTVFeeds = [
        {"name":"press tv", "url": "http://edition.presstv.ir/rss", "category" : "headlines"},
        /*
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510203", "category" : "americas"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510218", "category" : "uk"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510204", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        {"name":"press tv", "url": "http://edition.presstv.ir/rss/?section=3510202", "category" : "middle east"},
        */

    ];

    for(var i = 0; i < bbcFeeds.length; i++) {

        var feed = bbcFeeds[i];
        console.log(feed);
        var feed = new FeedModel(feed);
        feed.save();
    }

    res.end('{"success" : "Feeds Seeded Successfully", "status" : 200}');

};



//http://151.80.38.74:3000/api/v1.0/admin/scrapeUrlTest/
exports.scrapeUrl = function(req, res) {
    var sort = -1; //descending
    var url = 'http://news.sky.com/story/man-jailed-for-10-months-still-in-prison-11-years-later-10662504';

    var request = require('request');
    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            $ = cheerio.load(body, {
                normalizeWhitespace: false,
                xmlMode: false,
                decodeEntities: true
            });
            var textBody = " ";
            $('img').remove();
            $('script').remove();
            $('style').remove();
            $('iframe').remove();
            $('a').remove();
            $('link').remove();

            var tooShort = false;
            var company = 'sky';
            switch (company) {


                case "sky":
                    $('h1, .story__byline, .ad, .ad--mpu, .ad--mpu-story, .promo--story-mobile, .story__media, .sponsorship, .module, .video, .last-updated, .share, .partner-links, .story__post-content').remove();
                    textBody = $('.site-main').html();
                    //textBody = $('.sky-component-story-article"').html();
                    res.end('{"success" : ' + textBody + ', "status" : 200}');
                    break;
            }

        } else {
          res.end('{"success" : "error->' +error+'", "status" : 200}');
        }
    });

};
