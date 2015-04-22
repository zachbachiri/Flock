var infoMap = [
    { title: 'Search Tweets',       section: "Sidebar",         msg: 'Enter a term representing a user, hashtag, or keywords.' },
    { title: 'Tweet Count',         section: "Sidebar",         msg: 'The number of tweets that were returned from the search.' },
    { title: 'Location',            section: "Filter",          msg: 'The location here is used and translated to its latitude and longitude.' +
                                                                     '<ul>' +
                                                                     '<li>lat:  The latitude of the location this tweet refers to. ' +
                                                                                'This parameter will be ignored unless it is inside the range -90.0 to +90.0 (North is positive) inclusive. ' + 
                                                                                'It will also be ignored if there isn’t a corresponding long parameter.</li>' +
                                                                     '<li>long: The longitude of the location this tweet refers to. ' +
                                                                                'This parameter will be ignored unless it is inside the range -180.0 to +180.0 (East is positive) inclusive. ' +
                                                                                'It will also be ignored if there isn’t a corresponding lat parameter.</li>' +
                                                                     '</ul>' },
    { title: 'Exclusion Terms',     section: "Filter",          msg: 'Allows user to enter a keyword to be excluded from the search. Multiple keywords may be provided so long as they are delimited by a comma.' },
    { title: 'Date',                section: "Filter",          msg: 'Start Date: Returns tweets generated since the given date. Date should be formatted as YYYY-MM-DD.</p><p>' +
                                                                     'End Date: Returns tweets generated until the given date. Date should be formatted as YYYY-MM-DD.</p><p> ' +
                                                                     'Please note that the search index is limited as Twitter archives only 1 week of tweets.' },
    { title: 'Sensitivity',         section: "Filter",          msg: 'Set to true for content which may not be suitable for every audience as deemed by Twitter.' },
    { title: 'Results Type',        section: "Filter",          msg: 'Specifies what type of search results you would prefer to receive. The current default is “mixed.” Valid values include:' +
                                                                     '<ul>' +
                                                                     '<li>mixed: Include both popular and real time results in the response.</li>' +
                                                                     '<li>recent: return only the most recent results in the response.</li>' +
                                                                     '<li>popular: return only the most popular results in the response.</li>' +
                                                                     '</ul>' },
    { title: '# Of Tweets',         section: "Filter",          msg: 'The number of tweets to return per search, up to a maximum of 100. Defaults to 15.' },
    { title: 'Word Cloud',          section: "Visual",          msg: 'Cloud of words associating font size with frequency of words appearing in search results.' },
    { title: 'Hashtag Histogram',   section: "Visual",          msg: 'Bar graph of hashtags and associated frequencies found in search results. Only hashtags with frequencies greater than one are displayed.' },
    { title: 'Heatmap',             section: "Visual",          msg: 'World map with highlighted sections designating tweet origins from the current search results. ' +
                                                                     'Please note only some tweets have location data available if a location filter has not been specified, ' + 
                                                                     'so some tweets may not appear in this map.' },
    { title: 'Username',            section: "Download",        msg: 'Provides the author of tweet\'s username.' },
    { title: 'Country',             section: "Download",        msg: 'Provides the tweet\'s country of origin of tweet.' },
    { title: 'Location',            section: "Download",        msg: 'Provides the tweet\'s City & State of origin.' },
    { title: 'Timestamp',           section: "Download",        msg: 'Provides the weekday, month, day, time, timezone, and year tweet was created.' },
    { title: 'Message',             section: "Download",        msg: 'Provides the text from tweet.' },
    { title: 'Media',               section: "Download",        msg: 'Provides the link to media attached to tweet (if any).' },
    { title: 'Favorited',           section: "Download",        msg: 'Provides information on whether tweet has been favorited (true or false).' },
    { title: 'Favorite Count',      section: "Download",        msg: 'Provides the number of times tweet has been favorited.' },
    { title: 'Replied To',          section: "Download",        msg: 'Provides the username of person that tweet is replying to (if any).' },
    { title: 'Total Followers',     section: "Download",        msg: 'Provides the number of users following the author of tweet at time of tweet.' },
    { title: 'Total Friends',       section: "Download",        msg: 'Provides the number of users that the author of tweet had followed at the time of tweet.' },
    { title: 'Total Favorites',     section: "Download",        msg: 'Provides the number of tweets that the author of tweet had favorited at the time of tweet.' },
    { title: 'Tweet Mentions',      section: "Download",        msg: 'Provides list of mentions included in tweet.' },
    { title: 'Tweet Hashtags',      section: "Download",        msg: 'Provides list of hashtags included in tweet.' }
]