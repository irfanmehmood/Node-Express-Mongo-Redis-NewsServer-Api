/*
 JSON.stringify(keywords)
 We use this method to encode javascript array to be passed as a json object, to api calls

 Otherwise I use, res.json generic method to pass mondodb records, which are passed as json onject
 */



var mongoose = require('mongoose');
var FeedModel = mongoose.model('FeedModel');
var FeedItemModel = mongoose.model('FeedItemModel');
var wordCruncher = require('../lib/wordcruncher.js');
var cruncher = new wordCruncher("test");

exports.index = function(req, res) {

    res.send('FeedCtrl: index');

};

exports.listFeeds = function(req, res) {

    client.get('newsFeeds1', function(err, reply) {

        if (reply == null) {

            FeedModel.find({}, function(err, newsFeeds) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({ message: err  });
                } else {
                    /* JSON.parse is the opposite of JSON.stringify */
                    if (newsFeeds.length > 0) {
                        console.log("cached: newsFeeds: " + newsFeeds.length);
                        client.set('newsFeeds', JSON.stringify(newsFeeds));
                    }
                    res.json(newsFeeds);
                }
            });

        } else {
            //console.log(reply);
            res.json(JSON.parse(reply));
        }
    });

};

exports.listCategoriesBySource = function(req, res) {

    var sort = -1; //descending

    var slug = req.params.slug;

    //console.log(slug);


    FeedModel.find( { slug : slug}, {category: 1, _id:0}  , function(err, categories) {

        if (err) {

            //console.log(err);
            return res.status(400).send({
                message: err
            });

        } else {
            res.json(categories);
        }

    }).sort( {_id : sort} );

};

exports.listSourcesByCategory = function(req, res) {

    var sort = -1; //descending

    var category = req.params.category;


    FeedModel.find( { 'category' : category}, {name: 1, _id:0}  , function(err, sources) {

        if (err) {

            //console.log(err);
            return res.status(400).send({
                message: err
            });

        } else {
            res.json(sources);
        }

    }).sort( {_id : sort} );

};

exports.listFeedsBySource = function(req, res) {

    var sort = -1; //descending

    var slug = req.params.slug;

    //console.log(slug);


    FeedModel.find( { slug : slug } , function(err, feeds) {

        if (err) {

            //console.log(err);
            return res.status(400).send({
                message: err
            });

        } else {
            res.json(feeds);
        }

    }).sort( {_id : sort} );

};

exports.listFeedCategories = function(req, res) {

    client.get('newsCategories', function(err, reply) {

        if (reply === null) {


            FeedModel.aggregate([
                    { $group: {_id : "$category", total:  { $sum : 1}}},
                    { $sort : { _id : -1}}
                ] , function(err, categories) {

                if (err) {

                    console.log(err);
                    return res.status(400).send({ message: err });

                } else {

                    if (categories.length > 0) {
                        /* JSON.parse is the opposite of JSON.stringify */
                        console.log("cached: newsCategories: " + categories.length);
                        client.set('newsCategories', JSON.stringify(categories));
                    }
                    res.json(categories);
                }
            });

        } else {
            //console.log(reply);
            res.json(JSON.parse(reply));
        }

    });


};

exports.listFeedSources = function(req, res) {

    client.get('newsSources', function(err, reply) {

        if (reply === null) {

            FeedModel.aggregate([{$group: {_id: { group: "$group", slug: "$slug", name: "$name" }}}] , function(err, sources) {
                //FeedModel.aggregate({ $group: { _id: { group: "$group", slug: "$slug", name: "$name" } } } , function(err, sources) {

                if (err) {

                    console.log(err);

                } else {

                    /* JSON.parse is the opposite of JSON.stringify */
                    if (sources.length > 0) {
                        console.log("cached: newsSources: " + sources.length);
                        client.set('newsSources', JSON.stringify(sources));
                    }
                    res.json(sources);
                }
            });

        } else {
            //console.log(reply);
            res.json(JSON.parse(reply));
        }

    });

};



var sourceCategories = [];
var sourceCategoriesFeedItems = [];


function listFeedItemsBySourceCategories(sourceSlug, res, i) {

    if (i >= sourceCategories.length) {
        //console.log(sourceCategoriesFeedItems);
        res.json(sourceCategoriesFeedItems);
        client.set('listFeedItemsBySource' + "-" + sourceSlug, JSON.stringify(sourceCategoriesFeedItems));
        sourceCategories = [];
        sourceCategoriesFeedItems = [];

    } else {
        var cat = sourceCategories[i];
        //console.log(cat);
        FeedItemModel.find( { 'category' : cat.category, 'companySlug' : sourceSlug} , function(err, feedItems) {

            if (err) {

                console.log(err);

            } else {
                if (feedItems.length > 0) {

                    for (var z=0;z<feedItems.length;z++) {
                        sourceCategoriesFeedItems.push(feedItems[z]);
                    }

                }

                i = i + 1;
                listFeedItemsBySourceCategories(sourceSlug, res, i);

            }

        }).sort( {_id : -1} ).limit(10);

    }

}


exports.listFeedItemsBySource = function(req, res, next) {

    var sourceSlug = req.params.slug;

    client.get('listFeedItemsBySource' + "-" + sourceSlug, function(err, reply) {

        if (reply == null) {

            //console.log(sourceSlug);


            FeedModel.find( { slug : sourceSlug}, {category: 1, _id:0}  , function(err, sourceCats) {

                if (err) {

                    //console.log(err);
                    return res.status(400).send({
                message: err
            });

                } else {

                    sourceCategories = sourceCats;
                    listFeedItemsBySourceCategories(sourceSlug,  res, 0);
                }

            }).sort( {_id : -1} );

        } else {
            //console.log(reply);
            res.json(JSON.parse(reply));
        }


    });

};



exports.listFeedItemsByCategory = function(req, res) {

    var category = req.params.category;

    client.get('listFeedItemsByCategory' + "-" + category, function(err, reply) {

        if (reply === null) {

            var sort = -1; //descending

            //console.log(category);


            FeedItemModel.find( { category : category } , function(err, feedItems) {

                if (err) {

                    console.log(err);
                    return res.status(400).send({
                message: err
            });

                } else {
                    client.set('listFeedItemsByCategory' + "-" + category, JSON.stringify(feedItems));
                    res.json(feedItems);
                }

            }).sort( {_id : sort} ).limit(100);

        } else {
            //console.log(reply);
            res.json(JSON.parse(reply));
        }


    });

};

exports.listKeyWordsBetweenDates = function(req, res) {

    var start_date = req.params.stdate;
    var end_date = req.params.stdate;

    var redisKey = 'listKeyWordsBetweenDates'+ start_date + end_date;

    client.get(redisKey + "-", function(err, dateKeywords) {

        if (dateKeywords === null) {
            _listKeyWordsBetweenDates(start_date, end_date, redisKey, res);
        } else {
            //console.log(dateKeywords);
            res.json(JSON.parse(dateKeywords));
            //console.log("Cache - Latest News Accesses");
        }

    });

};


exports.listKeyWordsByDate = function(req, res) {

    var date_for = req.params.date;

    var redisKey = 'listKeyWordsByDate-'+ date_for;

    client.get(redisKey, function(err, dateKeywords) {

        if (dateKeywords === null) {
            _listKeyWordsByDate(date_for, redisKey, res);
        } else {
            //console.log(dateKeywords);
            res.json(JSON.parse(dateKeywords));
            //console.log("Cache - Latest News Accesses");
        }

    });

};

function _listKeyWordsBetweenDates(start_date, end_date, redisKey, res) {

    /* This is the date for which records should listed */
    /* Since we are storing dates with time, just passing only date wont work */
    //console.log(date_for);


    start_date = start_date.split("-");
    //console.log(date_for[0] + "/" + date_for[1]+ "/" +date_for[2]);

    //var start_date = new Date(2015, 10, 5, 00, 00, 00);
    var stdate = new Date(start_date[0], start_date[1], start_date[2], 00, 00, 00);
    //console.log(start_date);
    /* We have to create an endate, which is used as an end marker for the date for which news items
     are requested
     */

    end_date = end_date.split("-");
    var enddate = new Date(end_date[0], end_date[1], end_date + 1, 00, 00, 00, 00);
    //console.log(end_date);

    FeedItemModel.find( {"created": {"$gte": enddate, "$lt": stdate}} , 'created title', function(err, feedItems) {
        //FeedItemModel.find( {} , function(err, feedItems) {

        if (err) {

            console.log(err);
            return res.status(400).send({
                message: err
            });

            return null;

        } else {

            var allText = '';
            for (var i = 0; i< feedItems.length; i++){
                allText += " " + feedItems[i].title;
            }

            cruncher.setText(cruncher.cleanText(allText));
            var keywordsCollected = cruncher.crunch(10);

            if (keywordsCollected.length <= 10) {
                keywordsCollected = cruncher.crunch(5);
                if (keywordsCollected.length <= 5) {
                    keywordsCollected = cruncher.crunch(2);
                }
            }

            //console.log(keywordsCollected);
            //This is needed as we are storing javascript array in redis JSON.stringify
            client.set(redisKey, JSON.stringify(keywordsCollected), function(err, reply) {
                res.json(keywordsCollected);
            });
        }
    });
};

function _listKeyWordsByDate(date_for, redisKey, res) {

    /* This is the date for which records should listed */
    /* Since we are storing dates with time, just passing only date wont work */
    //console.log(date_for);


    date_for = date_for.split("-");
    //console.log(date_for[0] + "/" + date_for[1]+ "/" +date_for[2]);

    //var start_date = new Date(2015, 10, 5, 00, 00, 00);
    var start_date = new Date(date_for[0], date_for[1], date_for[2], 00, 00, 00);
    //console.log(start_date);
    /* We have to create an endate, which is used as an end marker for the date for which news items
    are requested
     */

    var dayPlus = date_for[2] + 1;
    var end_date = new Date(date_for[0], date_for[1], dayPlus, 00, 00, 00, 00);
    //console.log(end_date);

    FeedItemModel.find( {"created": {"$gte": start_date, "$lt": end_date}} , 'created title', function(err, feedItems) {
        //FeedItemModel.find( {} , function(err, feedItems) {

        if (err) {

            console.log(err);
            return res.status(400).send({
                message: err
            });

            return null;

        } else {

            var allText = '';
            for (var i = 0; i< feedItems.length; i++){
                allText += " " + feedItems[i].title;
            }

            //console.log("TEst" + allText);
            //console.log(feedItems);
            //Got My all text from the selected date articles "Titles", Lets crunch it now
            cruncher.setText(cruncher.cleanText(allText));
            var keywordsCollected = cruncher.crunch(10);

            if (keywordsCollected.length <= 10) {
                keywordsCollected = cruncher.crunch(5);
                if (keywordsCollected.length <= 5) {
                    keywordsCollected = cruncher.crunch(2);
                }
            }

            //console.log(keywordsCollected);
            //This is needed as we are storing javascript array in redis JSON.stringify
            client.set(redisKey, JSON.stringify(keywordsCollected), function(err, reply) {
                res.json(keywordsCollected);
            });


            //console.log(keywordsCollected);
        }
    });
};


exports.listFeedItemsBySourceAndCategory = function(req, res) {

    var category = req.params.category;
    var companySlug = req.params.companySlug;
    var pageNo = req.params.pageNo;

    FeedItemModel.paginate({
                'category' : category,
                'companySlug' :  companySlug },
                { page: pageNo, limit: 16, sortBy: { _id: -1  }})
                .spread(function(feedItems, pageCount, itemCount) {
                    //console.log("pageCount" + pageCount);
                    //console.log("itemCount: " + itemCount);
                    var response = [];
                    response.push(feedItems);
                    response.push(pageCount);
                    response.push(itemCount);
                    res.json(response);
                })
                .catch(function(err) {
                    return next(err);
                });

};

exports.getFeedItem = function(req, res) {

    var id = req.params.id;

    FeedItemModel.findOne({_id : id}, function(err, feedItem) {

        if (err) {

            console.log(err);
            return res.status(400).send({
                message: err
            });

        } else {

            //console.log(feedItem);

            if (feedItem) {
                var title = feedItem.title;
                title = title.replace(/\W+/g, " ");


                var t = cruncher.cleanTextGiveWordsList(title);

                //console.log(t);


                var re = new RegExp(t[0], 'i');
                var re1 = new RegExp(t[1], 'i');
                var re2 = new RegExp(t[2], 'i');

                FeedItemModel.find({},{description:0, keyWords:0}).or(
                    [{ 'title': { $regex: re }}, { 'title': { $regex: re1 }}, { 'title': { $regex: re2 }}])
                    .sort( {_id : -1} )
                    .limit(10)
                    .exec(function(err, relatedItems) {
                        // res.json(JSON.stringify(relatedItems));
                        //console.log(relatedItems);

                        if (err) {

                            console.log(err);
                            return res.status(400).send({
                                message: err
                            });

                        } else {

                            var totalObject = [];
                            totalObject[0] = feedItem;
                            totalObject[1] = relatedItems;
                            res.json(totalObject);
                        }
                    });
            } else {

                /*
                FeedItemModel.remove({ _id : id }, function(err) {
                    if (!err) {
                        console.log("delete news");
                        res.json('false');
                    }
                    else {
                        console.log(err);
                        return next(err);
                    }
                });
                */
                console.log("Feed Item Null for:" + id);
                console.log(feedItem);


            }

        }
    });
};


exports.searchFeedItems= function(req, res) {

    var term = req.params.term;
    var pageNo = req.params.pageNo;

    FeedItemModel.paginate({"title" : new RegExp(term, 'i')}, {
        page: pageNo, limit: 16, sortBy: { _id: -1  }
    })
        .spread(function(feedItems, pageCount, itemCount) {
            //console.log("pageCount" + pageCount);
            //console.log("itemCount: " + itemCount);
            var response = [];
            response.push(feedItems);
            response.push(pageCount);
            response.push(itemCount);
            res.json(response);
        })
        .catch(function(err) {
            return next(err);
        });


};






exports.listFeedItems = function(req, res) {

    FeedItemModel.find({}, function(err, feedItems) {

        if (err) {

            console.log(err);
            return res.status(400).send({
                message: err
            });

        } else {
            res.json(feedItems);
        }

    });

};

var latestNews = [];

function _get_latest_news(i, res) {

    client.get('newsCategories', function(err, _newsCategories) {

        _newsCategories = JSON.parse(_newsCategories);


        if (i >= _newsCategories.length) {

            /* We have looped all the categories */

            client.set('latestNews', JSON.stringify(latestNews), function(err, reply) {
                res.json(latestNews);

                //Clear local array
                latestNews = [];

                console.log("Re-Cached - Latest News Accesses");

            });

        } else {

            var category = _newsCategories[i];
            var categoryName = category._id;
            //console.log();

            FeedItemModel.find( { category : categoryName } , function(err, feedItems) {

                if (err) {

                    console.log(err);
                    return res.status(400).send({
                message: err
            });

                } else {

                    // Loop through all found items and add to the array
                    for (z = 0; z < feedItems.length; z++) {
                        var item = feedItems[z];
                        //console.log(item);
                        latestNews.push(item);
                    }

                    _get_latest_news(i + 1, res);
                }

            }).sort( {_id : -1} ).limit(1);

        }


    });

}
/* This function gets the latest 2 news each from each category */
/* So in total 12 */

exports.getLatestNews = function(req, res) {


    client.get('latestNews', function(err, latestNews) {

        if (latestNews == null) {
            //console.log("Mongo - Latest News Accesses");
            _get_latest_news(0, res);
        } else {
            res.json(JSON.parse(latestNews));
            //console.log("Cache - Latest News Accesses");
        }

    });



};

function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

var shuffleArray = function(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}


var headlineNews = [];
var dashboardSourceNewsList = [];

function _get_headline_news(i, res, _newsSources) {
    if (i >= _newsSources.length) {

        /* We have looped all the categories */
        var totalFound = headlineNews.length;
        if (totalFound > 0) {
            console.log("Re-Cached - Headline News Accesses - Total Items: " + totalFound);
            client.set('headlineNews', JSON.stringify(headlineNews), function(err, reply) {});
        }
        res.json(headlineNews);

    } else {
        //console.log(i);
        var station = _newsSources[i]._id;
        var stationName = station.name;
        FeedItemModel.find(
            {
                company : stationName,
                category: 'headlines'
            },
            {
                description: 0
            }
        ).sort(
            {_id : -1} )
            .limit(8).exec(
            function(err, feedItems) {
                if (err) {
                    console.log(err);

                } else {
                    // Loop through all found items and add to the array
                    for (var z = 0; z < feedItems.length; z++) {
                        var item = feedItems[z];
                        //console.log(item);
                        headlineNews.push(item);
                    }
                    //console.log("feedItems:" + feedItems.length+ " headlineNews: " + headlineNews.length);
                    //console.log("-------------------")

                    i++;
                    _get_headline_news(i, res, _newsSources);

                }
        });

    }



}

function _getDashboardSourceNews(i, res, _newsSources) {
    if (i >= _newsSources.length) {

        /* We have looped all the categories */
        var totalFound = dashboardSourceNewsList.length;
        if (totalFound > 0) {
            console.log("Re-Cached - Headline News Accesses - Total Items: " + totalFound);
            client.set('dashboardSourceNewsList', JSON.stringify(dashboardSourceNewsList), function(err, reply) {});
        }
        res.json(dashboardSourceNewsList);

    } else {
        //console.log(i);
        var station = _newsSources[i]._id;
        var stationName = station.name;
        FeedItemModel.find(
            {
                company : stationName,
                /*category: 'headlines'*/
            },
            {
                description: 0
            }
        ).sort(
            {_id : -1} )
            .limit(9).exec(
            function(err, feedItems) {
                if (err) {
                    console.log(err);

                } else {
                    // Loop through all found items and add to the array
                    for (var z = 0; z < feedItems.length; z++) {
                        var item = feedItems[z];
                        //console.log(item);
                        dashboardSourceNewsList.push(item);
                    }
                    //console.log("feedItems:" + feedItems.length+ " dashboardSourceNewsList: " + headlineNews.length);
                    //console.log("-------------------")

                    i++;
                    _getDashboardSourceNews(i, res, _newsSources);

                }
            });

    }



}
function __delete_all_feed_items() {

    var request = require('request');
    request(config.api_url + '/api/v1.0/admin/feed/item/delete', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("All News Items Deleted");
        }
    });

}


exports.getHeadlineNews = function(req, res) {

    //__delete_all_feed_items();
    client.get('headlineNews', function(err, newsItems) {

        if (newsItems === null) {
            client.get('newsSources', function(err, _newsSources) {
                if (newsItems === null) {
                    var request = require('request');
                    request(config.api_url + '/api/v1.0/feed/listFeedSources', function (error, response, body) {
                        _newsSources = body;
                        console.log("From DataBase - Latest News Accesses.");
                        headlineNews = [];
                        _get_headline_news(0, res, JSON.parse(_newsSources));
                    });
                } else {
                    _get_headline_news(0, res, JSON.parse(_newsSources));
                }

            });
        } else {
            var headlinesJSON = JSON.parse(newsItems);
            res.json(headlinesJSON);
            //console.log(headlinesJSON);
            console.log("From Cache - Data - Latest News Accesses: " + headlinesJSON.length + " items.");
        }

    });

};

exports.getDashboardSourceNewsList = function(req, res) {

    //__delete_all_feed_items();
    client.get('dashboardSourceNewsList', function(err, newsItems) {

        if (newsItems === null) {
            client.get('newsSources', function(err, _newsSources) {
                if (newsItems === null) {
                    var request = require('request');
                    request(config.api_url + '/api/v1.0/feed/listFeedSources', function (error, response, body) {
                        _newsSources = body;
                        console.log("From DataBase - Dashboard Source News List");
                        dashboardSourceNewsList = [];
                        _getDashboardSourceNews(0, res, JSON.parse(_newsSources));
                    });
                } else {
                    _getDashboardSourceNews(0, res, JSON.parse(_newsSources));
                }

            });
        } else {
            var dashboardSourcesJSON = JSON.parse(newsItems);
            res.json(dashboardSourcesJSON);
            //console.log(dashboardSourcesJSON);
            console.log("From Cache - Dashboard News List: " + dashboardSourcesJSON.length + " items.");
        }

    });

};
