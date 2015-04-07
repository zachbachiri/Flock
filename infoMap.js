var infoMap = [
    { title: 'Search',              msg: 'Enter a term representing a user, hashtag, or keywords.' },
    { title: 'Location',            msg: 'The location here is used and translated to its latitude and longitude.' +
                                         '<ul>' +
                                         '<li>lat:  The latitude of the location this tweet refers to. ' +
                                                    'This parameter will be ignored unless it is inside the range -90.0 to +90.0 (North is positive) inclusive. ' + 
                                                    'It will also be ignored if there isn’t a corresponding long parameter.</li>' +
                                         '<li>long: The longitude of the location this tweet refers to. ' +
                                                    'This parameter will be ignored unless it is inside the range -180.0 to +180.0 (East is positive) inclusive. ' +
                                                    'It will also be ignored if there isn’t a corresponding lat parameter.</li>' +
                                         '</ul>' },
    { title: 'Date',                msg: 'Start Date: Returns tweets generated since the given date. Date should be formatted as YYYY-MM-DD.</p><p>' +
                                         'End Date: Returns tweets generated until the given date. Date should be formatted as YYYY-MM-DD.</p><p> ' +
                                         'Please note that the search index is limited as Twitter archives only 1 week of tweets.' },
    { title: 'Sensitivity',         msg: 'Set to true for content which may not be suitable for every audience as deemed by Twitter.' },
    { title: 'Results Type',        msg: 'Specifies what type of search results you would prefer to receive. The current default is “mixed.” Valid values include:' +
                                         '<ul>' +
                                         '<li>mixed: Include both popular and real time results in the response.</li>' +
                                         '<li>recent: return only the most recent results in the response.</li>' +
                                         '<li>popular: return only the most popular results in the response.</li>' +
                                         '</ul>' },
    { title: '# Of Tweets',         msg: 'The number of tweets to return per search, up to a maximum of 100. Defaults to 15.' },
    { title: 'Tweet Count',         msg: 'The number of tweets that were returned from the search.' },
    { title: 'Word Cloud',          msg: 'Cloud of words associating font size with frequency of words appearing in search results.' },
    { title: 'Hashtag Histogram',   msg: 'Bar graph of hashtags and associated frequencies found in search results.' },
    { title: 'Username',            msg: 'Provides author of tweet\'s username.' },
    { title: 'Country',             msg: 'Provides tweet\'s country of origin of tweet.' },
    { title: 'Location',            msg: 'Provides tweet\'s City & State of origin.' },
    { title: 'Timestamp',           msg: 'Provides Weekday, Month, Day, Time, Timezone, Year of tweet.' },
    { title: 'Message',             msg: 'Provides text from tweet.' },
    { title: 'Media',               msg: 'Provides link to media attached to tweet (if any).' }
]