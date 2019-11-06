var config = require('./app/config/config.js');

var fs = require('fs');
var cronCounter = getCounter();

var mongoose = require('./app/config/mongoose.js');
var db = mongoose();

console.log("Server: " + config.api_url + " -> cronCounter: " + cronCounter);
console.log("Cron File: " + config.cron_file_path);

//return;
var wordcruncher = require('./app/lib/wordcruncher.js');
cruncher = new wordcruncher();


var mongoose = require('mongoose');
var Schema = require('./app/models/feedItems.server.model');
var FeedItemModel = mongoose.model('FeedItemModel');
var redis = require('redis');
var client = redis.createClient(); //creates a new client
var cheerio = require('cheerio');

var _newsCategories = [];
var _newsSources = [];
var _newsFeeds;
var request = require('request');
var FeedParser = require('feedparser');
require('events').EventEmitter.prototype._maxListeners = 100;

function rebuild_node_start_cache() {
    var today = new Date();
    var dateKey = 'listKeyWordsByDate-'+ today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    var yesterdayKey = 'listKeyWordsByDate-'+ yesterday.getFullYear() + "-" + yesterday.getMonth() + "-" + yesterday.getDate();

    console.log("latestNews: deleted -> " + today);
    client.del('latestNews', function(err, reply) {

    });
    client.del('dashboardSourceNewsList', function(err, reply) {

    });
    client.del(dateKey, function(err, reply) {

    });
    client.del(yesterdayKey, function(err, reply) {
        //console.log("headlineNews: deleted");
    });
}





//var jsdom = require("jsdom");


function _cache_categories_source_feeds() {

    request(config.api_url + '/api/v1.0/feed/listFeedCategories', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //return console.log(JSON.parse(body));
            _newsCategories = JSON.parse(body);
            //console.log("ServerCron:_newsCategories=" + _newsCategories.length);
            //console.log(_newsCategories);
        }
        request(config.api_url + '/api/v1.0/feed/listFeedSources', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                _newsSources = JSON.parse(body);
                //console.log("ServerCron:_newsSources=" + _newsSources.length);

            }
            request(config.api_url + '/api/v1.0/feed/listFeeds', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    _newsFeeds = JSON.parse(body);
                    //console.log("ServerCron:_newsFeeds=" + _newsFeeds.length);
                }
                _finish();
            });
        });

    });

}

var ban_list_bbc = ["VIDEO: ", "In pictures:", "Quiz of the week"];
var ban_list_sky = ["Front Pages"];
var ban_list_washingtonpost = ["World Digest:", "AP PHOTOS:", "The Latest:"];
var ban_list_rt = ["(VIDEO)", "LIVE UPDATES", "(PHOTOS)"];




function _news_item_in_ignore_list(item) {

    switch (item.company) {

        case "washington post":
            var arrayLength = ban_list_washingtonpost.length;
            for (var i = 0; i < arrayLength; i++) {

                //console.log("Comparing: " + item.title + " with : " + ban_list_bbc[i]);
                if (item.title.search(ban_list_washingtonpost[i]) >= 0){
                    //console.log("Found");
                    return true;
                }
            }

            break;

        case "bbc":
            var arrayLength = ban_list_bbc.length;
            for (var i = 0; i < arrayLength; i++) {

                //console.log("Comparing: " + item.title + " with : " + ban_list_bbc[i]);
                if (item.title.search(ban_list_bbc[i]) >= 0){
                    //console.log("Found");
                    return true;
                }
            }

            break;

        case "sky":
            var arrayLength = ban_list_sky.length;
            for (var i = 0; i < arrayLength; i++) {

                if (item.title.search(ban_list_sky[i]) >= 0){
                    //console.log("Found");
                    return true;
                }
            }

            break;

        case "rt news":
            var arrayLength = ban_list_rt.length;
            for (var i = 0; i < arrayLength; i++) {

                if (item.title.search(ban_list_rt[i]) >= 0){
                    //console.log("Found");
                    return true;
                }
            }

            break;

    }

    return false;
}



_getFeedItemsForFeed = function(feed) {


    var httpRequest = require('request');

    var c = 0;

    var options = [];

    var httpRequestResponse = httpRequest(feed.url, {timeout: 5000, pool: false});
    httpRequestResponse.setMaxListeners(50);



    var feedparser = new FeedParser([options]);

    httpRequestResponse.on('error', function (error) {
        // handle any request errors
        if (err.message.code === 'ETIMEDOUT') {
            /* apply logic */
            console.log("httpRequestResponse: irfan - handle");
        }

    });

    httpRequestResponse.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });


    feedparser.on('error', function(error) {
        if (err.message.code === 'ETIMEDOUT') {
            /* apply logic */
            console.log("feedparser: irfan - handle");
        }
    });

    feedparser.on('readable', function() {

        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;




    });

};


var getErrorMessage = function(err) {

    if ( err && err.code !== 11000 ) {
        console.log(err);
        console.log(err.code);
        return ('Another error showed up');
    }

    //duplicate key
    if ( err && err.code === 11000 ) {
        return('error', 'URL exists.');
    }
};


var categoriesFeedsToProcess = [];

function _finish() {

    var d = new Date();
    if (cronCounter >= _newsCategories.length) {
        cronCounter = 0;
    }
    //console.log(_newsFeeds);return;
    var category = _newsCategories[cronCounter]._id;
    console.log("--------------------------------------------------------------");
    console.log("Category: " + category + " | Cron Conter:" + cronCounter + " | Time:" + d.getHours() + ":" + d.getMinutes());
    console.log("--------------------------------------------------------------");

    for(var i = 0; i < _newsFeeds.length; i++) {

        var feed = _newsFeeds[i];

        // if (feed.category == category && feed.name == 'washington post') {
        if (feed.category == category) {

            //console.log(feed.name + " : " + feed.url);
            categoriesFeedsToProcess.push(feed);
            //_getFeedItemsForFeed(feed);
        }

    }
    getCategoryFeedItems(0);
}

var totalItems = [];


function scrapeCategoryFeedItems(i) {

    if (i >= totalItems.length) {

        //console.log(totalItems);
        console.log("---------------------------------");
        console.log("Total Items Scrapped: " + totalItems.length);
        if (totalItems.length > 0) {
            rebuild_node_start_cache();
        }
        totalItems = [];
        //var exec = require('child_process').exec;
        cronCounter++;
        saveCounter(cronCounter);

        //scrapeCategoryFeedItems(i);
    } else {

        var feedItem = totalItems[i];

        if (feedItem.title == null) {
            console.log("invalid feeditem");
            console.log(feedItem.title);
            //client.set('url:' + feedItem.link, 1, function (err, reply) { });
            i++;
            scrapeCategoryFeedItems(i);
        } else {
            client.get('url:' + feedItem.link, function (err, urlFound) {
                if (urlFound == null) {
                    if (_news_item_in_ignore_list(feedItem) == false) {
                        var options = {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 5000, //Five seconds
                            followRedirect: true,
                            maxRedirects: 50
                        };

                        request(feedItem.link, options, function (error, response, body) {

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
                                switch (feedItem.company) {

                                    case "rt news":
                                        $(' .article__breadcrumbs, .addthis_sharing_toolbox, .article__heading, .article__date, .article__short-url, .article__cover, .article__share, .rtcode').remove();
                                        textBody = $('.article').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        break;

                                    case "bbc":
                                        $('.share-tools--no-event-tag, #comp-pattern-library, .story-body__line, .story-body__crosshead, #comp-from-other-news-sites, .story-body__sub-heading, .story-body__unordered-list, .byline .bbccom_slot .mini-info-list, .share, figure, .story-more, .story-body__mini-info-list-and-share').remove();
                                        $('.byline, .idt__news, .footer, .bbccom_slot, .outbrain-ad').remove();
                                        textBody = $('.column--primary').html();

                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 3000) {
                                            tooShort = true;
                                        }
                                        break;

                                    case "sky":
                                        $('h1, .blackjack-sdc-site-share, .blackjack-sdc-site-share--article, .sdc-article-widget, .sdc-article-video, .sky-component-story-article__byline, .story__byline, .ad, .ad--mpu, .ad--mpu-story, .promo--story-mobile, .story__media, .sponsorship, .module, .video, .last-updated, .share, .partner-links, .story__post-content, .sky-component-social-share, .blackjack-sdc-image, .blackjack-sdc-article-video, .sky-component-gallery').remove();
                                        //textBody = $('article').html();
                                        textBody = $('.site-main').html();
                                        //textBody = $('sky-component-story-article"').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 3000) {
                                            tooShort = true;
                                        }
                                        break;

                                    case "cnn":
                                        $('cite, .media__video--thumbnail-wrapper,.el-editorial-note, .el-editorial-source, .el__embedded, .el__leafmedia, .el__leafmedia--storyhighlights, .zn-body__footer').remove();

                                        textBody = $('.zn-body__paragraph').html();
                                        textBody = textBody == null ? " " : textBody;
                                        textBody += $('#body-text').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 2000) {
                                            tooShort = true;
                                        }
                                        break;


                                    case "daily mail":

                                        $('h1, div#story-body p:first-child .mol-article-quote, .artSplitter, .imageCaption, #reader-comments, .rc-title, #most-read-news-wrapper, .shareArticles, #external-source-links, #most-watched-videos-wrapper, .shareArticles, .related-carousel, .mol-bullets-with-font, .byline-section, .author-section, #articleIconLinksContainer, .moduleFull, .mol-video').remove();
                                        textBody = $('.article-text').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 2000) {
                                            tooShort = true;
                                        }
                                        break;

                                    case "aljazeera":

                                        $('table, hr, .twitter-tweet, .in-article-item,  .MoreOnTheStory').remove();
                                        textBody = $('#article-body').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 1000) {
                                            tooShort = true;
                                        }
                                        break;


                                    case "reuters":

                                        // $('table, hr').remove();
                                        textBody = $('#articleText').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 1000) {
                                            tooShort = true;
                                        }
                                        break;

                                    case "washington post":

                                        $('.inline-photo, .inline-photo-normal, .pb-sig-line').remove();
                                        textBody = $('div#article-body').html();
                                        feedItem.description = textBody == null ? " " : textBody;
                                        if (feedItem.description.length < 1000) {
                                            //tooShort = true;
                                        }
                                        break;
                                }

                                //Russian News


                                if (!tooShort) {
                                    cruncher.setText(feedItem.description);
                                    //feedItem.description = cruncher.getCleanHTML(feedItem);
                                    feedItem.keyWords = JSON.stringify(cruncher.crunch(2));
                                    //After extracting page HTML we save the item in redis and database
                                    client.set('url:' + feedItem.link, 1, function (err, reply) {

                                        var Item = new FeedItemModel(feedItem);
                                        //Not Added try to add it
                                        Item.save(function (err) {
                                            if (err) {
                                                console.log(getErrorMessage(err) + " : " + feedItem.link);
                                                console.log("-------------------------------------------------------------");
                                                i++;
                                                scrapeCategoryFeedItems(i);

                                            } else {
                                                //console.log("Added->" + feedItem.title);
                                                console.log("Added->" + feedItem.company + ":" + feedItem.category);
                                                i++;
                                                scrapeCategoryFeedItems(i);

                                            }
                                        });
                                    });
                                } else {

                                    console.log("Too Short: " + feedItem.description.length + " ->  " + feedItem.link);
                                    //We save it in cache , mak as processed, so we dont have to process it again
                                    client.set('url:' + feedItem.link, 1, function (err, reply) {
                                        i++;
                                        scrapeCategoryFeedItems(i);

                                    });

                                }

                            } else if(error) {

                                console.log('irfan caught: ' + error);
                                i++;
                                scrapeCategoryFeedItems(i);

                            } else  {

                                console.log("irfan other: " + error);
                                i++;
                                scrapeCategoryFeedItems(i);
                            }
                        });

                    } else {

                        //We save it in cache , mak as processed, so we dont have to process it again
                        client.set('url:' + feedItem.link, 1, function (err, reply) {
                            i++;
                            scrapeCategoryFeedItems(i);

                        });

                    }

                } else {

                    //We already have this item in cace , so we increment and recall method
                    i++;
                    scrapeCategoryFeedItems(i);
                }


            });
        }
    }
}


function getCategoryFeedItems(i){

    if (i >= categoriesFeedsToProcess.length) {

        //console.log(totalItems);
        console.log("--------------------------------------------------------------");
        console.log("Total Items Collected: " + totalItems.length);
        console.log("--------------------------------------------------------------");
        //totalItems = [];
        categoriesFeedsToProcess = [];
        scrapeCategoryFeedItems(0);
    }

    else {

        var itemsCount = 0;

        var items = [];

        var feed = categoriesFeedsToProcess[i];

        var httpRequestResponse = request(feed.url, {timeout: 5000});



        httpRequestResponse.on('response', function (res) {

            var stream = this;

            if (res.statusCode != 200) {
                console.log("Bad feed.url: " + feed.url);
                i = i + 1;
                getCategoryFeedItems(i);
            } else {
                stream.pipe(feedparser);
            }
        });

        httpRequestResponse.on('error', function (error) {
            console.log("httpRequestResponse error: " + error);
            console.log("Bad feed.url: " + feed.url);
            i = i + 1;
            getCategoryFeedItems(i);
        });

        var options = [];

        var feedparser = new FeedParser([options]);

        feedparser.on('error', function (error) {
            console.log("here: " + error);
        });

        feedparser.on('readable', function () {

            // This is where the action is!
            var stream = this
                , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
                , item;


            while (item = stream.read()) {

                item.company = feed.name;
                item.category = feed.category;
                item.companySlug = feed.slug;
                totalItems.push(item);
                //console.log(item);
                itemsCount+=1;

            }

        });

        feedparser.on("end", function () {
            i++;
            console.log(feed.name + " found : " + itemsCount);
            getCategoryFeedItems(i);
            // console.log(items.length);
            // completedMe(items);
        });
    }



}


function getCounter() {

    if (!fileExists(config.cron_file_path + 'cron.json')) {
        console.log("count file not found");
        return 0;
    } else {
        console.log("counter loading");
        var cron = require(config.cron_file_path + 'cron.json');

        if (cron.count != 'undefined') {
            return cron.count;
        } else {
            return 0;
        }
    }
}

function fileExists(filePath) {
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}

function saveCounter(counter) {

    var myData = {
        count:  counter
    }

    var outputFilename = config.cron_file_path + 'cron.json';

    fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
        if(err) {
            console.log(err);
            process.exit();
        } else {
            console.log("JSON counter: " + counter + " saved to " + outputFilename);
            process.exit();
        }

    });

}


/*This starts the main process */
function run() {
    /* This call populate, caches and objects for importing process */
    _cache_categories_source_feeds();
};

run();
