var method = WordCruncher.prototype;

function WordCruncher(txt) {
    this._txt = txt;
    this._htmlBandTags =
    this._bannedList = ['being', 'from', 'have', 'with', "which", "this","been","where", "into",
                        'that', 'their', 'what', 'about', "there", "when", "still", "these","undefined",
                        'into', 'than', 'more', 'will', 'since', 'doing', 'last', 'just',
                        'could', 'should', 'would', 'year','cleared', 'first', 'said', 'xwartsplitter', 'them', 'because', 'bold', 'images', 'other', 'before', 'title', 'told', 'only', 'volt',

         'also', 'column', 'washingtonpost', 'content', 'some',
        'after', 'they', "would","were","over","your", "used", "else", "says"];
    this._allowedList = ['god', 'nasa', 'sex', 'usa'];
    //console.log('WordCruncher instantiated');
}


method.setText = function(text) {

    this._txt = text;

}

method.cleanTextGiveWordsList = function (text) {

    //This cleans all the text, makes it lowercase and then explodes the words in array
    var words = text.replace(/\W+/g, " ").toLowerCase().split(" ");
    var cleanWords = [];

    for(var i = 0; i < words.length; i++) {

        if (words[i].length > 3 && this._bannedList.indexOf(words[i]) == -1) {
            cleanWords.push(words[i]);
        }

    }

    return cleanWords;

}

method.cleanText = function (text) {

    //This cleans all the text, makes it lowercase.
    return text.replace(/\W+/g, " ").toLowerCase();

}



method.crunch = function(minimumAppearanceRequired) {

    var wordCounts = { };
    var words = this._txt.toLowerCase().split(" ");
    for(var i = 0; i < words.length; i++)
        wordCounts[words[i]] = (wordCounts[words[i]] || 0) + 1;
    var keywords = new Array();
    var value = '';
    for (var keyz in wordCounts) {
        value = wordCounts[keyz];
        if (!/[^a-z]/.test(keyz) && value > minimumAppearanceRequired && keyz.length > 3 && this._bannedList.indexOf(keyz) == -1) {
            //if (value > 10 && (key.length > 5 && key.length < 15)) {
            //console.log(keyz + ":" + value);
            keywords.push({'keyword' : keyz, 'count' : value});
        }

    }

    //This is so keywords array knows how to sort itself by value, property
    keywords.sort(function(a,b) {
        return a.count - b.count;
    });

    /* To get most popular keyword at the top */
    keywords.reverse();

    //console.log(keywords);
    return keywords;

};

module.exports = WordCruncher;


