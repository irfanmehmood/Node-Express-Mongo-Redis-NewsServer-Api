var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({

    name: {
        type: String,
        trim: true,
        required: 'Company Name cannot be blank'
    },
    slug: {
        type: String,
        trim: true,
        required: 'Slug cannot be blank'
    },
    url: {
        type: String,
        trim: true,
        unique: true,
        required: 'Feed Url cannot be blank'
    },
    category: {
        type: String,
        trim: true,
        required: 'Feed Category cannot be blank'
    },
    created: {
        type: Date,
        default: Date.now
    }

});

mongoose.model('FeedModel', FeedSchema);