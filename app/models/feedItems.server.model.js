var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');


var FeedItemSchema = new Schema({

    title: {
        type: String,
        trim: true,

    },
    company: {
        type: String,
        trim: true
    },
    companySlug: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true,
        unique: true,
    },
    keyWords: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

FeedItemSchema.plugin( mongoosePaginate );

/*
FeedItemSchema.pre("save",function(next, done) {
    var self = this;
    var md5 = crypto.createHash('md5');
    this.uniqHash = md5.update(this.link).digest('hex');
    mongoose.models["FeedItemModel"].findOne({uniqHash : self.uniqHash},function(err, FeedItemModel) {
        if(err) {
            done(err);
        } else if(FeedItemModel) {
            self.invalidate("uniqHash","duplicate: " + self.company + "-" + self.category);
            console.log("duplicate: " + self.company + "-" + self.category);
            //done(new Error("uniqHash must be unique"));
            done();
        } else {
            done();
        }
    });
    next();
});
*/


mongoose.model('FeedItemModel', FeedItemSchema);