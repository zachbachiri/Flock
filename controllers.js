var appControllers = angular.module('appControllers', ['masonry', 'ngDialog', 'ui.router', 'ui.directives']);

    //var flock_server_url = "http://localhost:5000";
    var flock_server_url = "https://flock-backend.herokuapp.com";
    var sessionId = '';

    // Array of stop words
    var stopWords = '';
    $.get("stopwords_en.txt", function(data) {
        stopWords = data.split('\n');
    });

/*
    @author:  Jimmy Ly
    @created: Mar 16, 2015
    @purpose: Initiate Login Controller
    @param:   $scope - object required for angular usage
              $state - object required for redirecting user to other states/pages
    @return:  void
*/
app.controller('LoginController', function($scope, $state){

    // Upon visiting the login page, check if the user is already logged in.
    // If so, sessionStorage should contain a 'sessionId' value that hasn't
    // expired. Make a call to the flock backend to check that the sessionId
    // is valid if present.
    if (sessionStorage.getItem('sessionId') != null){
        $.ajax({
            data: { session_id: sessionStorage.getItem('sessionId') },
            url: flock_server_url + "/checkSession",
            success: function(response){
                // If the session is found, then go directly to the search page
                if (response === "session found"){
                    $state.go('search');
                // Otherwise clear the expired session information from the browser
                } else {
                    sessionStorage.clear();
                }
            },
            error: function(error){
                // If an error occurs, then clear the current session information
                // and have the user login again
                sessionStorage.clear();
                console.log(error);
            }
        });
    }

    /*
        @name:    twitter_sign_in
        @author:  Jimmy Ly
        @created: Mar 16, 2015
        @purpose: Requests query tokens from backend and redirects to Twitter sign in
        @return:  void
    */
    $scope.twitter_sign_in = function(){
        $.ajax({
            url: flock_server_url + "/requestToken",
            success: function(response){
                // Set the sessionId provided by the backend to the sessionStorage
                // and redirect the user to the Twitter sign in page
                sessionStorage.setItem('sessionId', response[0]);
                window.location.href = response[1];
            },
            error: function(error){
                $scope.errorDialog('Sorry, there is an error with the login server. ' +
                            'Please check back soon!');
            }
        });
    };

    /*
        @name:    guest_sign_in
        @author:  Jimmy Ly
        @created: Mar 16, 2015
        @purpose: Set the default Guest session information, including the
                  sessionId as the guest sessionId, screen_name as 'Guest',
                  profile_image_url as the default Twitter profile image,
                  and fromLogin = true to prevent search page from initially
                  redirecting back to login page
        @return:  void
    */
    $scope.guest_sign_in = function(){
        // make a call to the flock backend to retrieve the Guest session information
        $.ajax({
            url: flock_server_url + "/guestSession",
            success: function(response){
                // Set default Guest session information as described in @purpose
                sessionStorage.setItem('sessionId', response.sessionId);
                sessionStorage.setItem('screen_name', response.screen_name);
                sessionStorage.setItem('profile_image_url', response.profile_image_url);
                sessionStorage.setItem('fromLogin', true);
                // Bring the user to the search page
                $state.go('search');
            },
            error: function(error){
                $scope.errorDialog('Sorry, there is an error with the login server. ' +
                            'Please check back soon!');
            }
        });
    };

});

/*
    @author:  Jimmy Ly
    @created: Mar 16, 2015
    @purpose: Initiate Redirect Controller
    @param:   $scope - object required for angular usage
              $location - object required for obtaining current URL
    @return:  void
*/
app.controller('RedirectController', function($scope, $location){

    /*
        @name:    redirect_error
        @author:  Jimmy Ly
        @created: Mar 16, 2015
        @purpose: Notify the user that an error has occurred during the redirect process
                  then bring the user back to the login page. Also clear current session
                  information
        @return:  void
    */
    $scope.redirect_error = function(){
        $scope.errorDialog('Sorry, there is an error with the login server. ' +
                    'Please try logging in as a Guest and check back soon!');
        sessionStorage.clear();
        window.location.href = current_url.split("?")[0] + "#/login";
    }

    // parse oauth query parameters from current URL provided by Twitter
    // i.e. http://www.northeastern.edu/flock/?oauth_token=...&oauth_verifier=...#/redirect
    var current_url = $location.absUrl();
    // i.e. oauth_token=...&oauth_verifier=...#/redirect
    var url_params = current_url.split("?")[1];
    // i.e [oauth_token=..., oauth_verifier=...]
    var query_params = url_params.split("#")[0].split("&");

    var oauth_params = {};
    var key_value_pair = [];

    // store oauth query parameters with a JSON object oauth_params
    for (var i = 0; i < query_params.length; i++) {
        key_value_pair = query_params[i].split("=");
        oauth_params[key_value_pair[0]] = key_value_pair[1];
    }
    // check to make sure the current page's URL contains the oauth token and verifier from Twitter
    if (_.has(oauth_params, 'oauth_token') && _.has(oauth_params, 'oauth_verifier')){
        // set session id in data to send to backend
        oauth_params.session_id = sessionStorage.getItem('sessionId');
        // url for backend access token request endpoint
        var request_url = flock_server_url + "/accessToken";
        $.ajax({
            data: oauth_params,
            url: request_url,
            success: function(response){
                // Set returned screen_name and profile_image_url for current user
                // in sessionStorage and redirect user to search page
                sessionStorage.setItem('screen_name', '@' + response.screen_name);
                sessionStorage.setItem('profile_image_url', response.profile_image_url);
                window.location.href = current_url.split("?")[0] + "#/search";
            },
            error: function(error){
                $scope.redirect_error();
            }
        });
    } else {
        $scope.redirect_error();
    }
});

/*
    @author:  Zach Bachiri
    @created: Jan 26, 2015
    @purpose: Initiate Main Controller
    @param:   $scope - object required for angular usage
    @param:   $q - string, search term
    @param:   ngDialog - ngDialog object
    @return:  void
*/
app.controller('MainController', function($scope, $q, $state, ngDialog){

    // Upon visiting the search page, check if the user is already logged in.
    // If the user is a Guest, then make sure they were just redirected from
    // the login page. Otherwise, remove the current session information and
    // bring the user back to the login page.
    if (sessionStorage.getItem('sessionId') != null && !sessionStorage.getItem('fromLogin')){
        $.ajax({
            data: { session_id: sessionStorage.getItem('sessionId') },
            url: flock_server_url + "/checkSession",
            success: function(response){
                // If the session id is invalid, then clear the current session information
                // and redirect the user to the login screen
                if (response === "session not found"){
                    sessionStorage.clear();
                    $state.go('login');
                }
            },
            error: function(error){
                sessionStorage.clear();
                $state.go('login');
            }
        });
    } else if (!sessionStorage.fromLogin){
        sessionStorage.clear();
        $state.go('login');
    }
    // Remove 'fromLogin' item from sessionStorage so that next time Guest visitor
    // will be redirected to login page to encourage signing in through Twitter
    // to reduce rate limit issue
    sessionStorage.removeItem('fromLogin');

    // Set default variable values
    $scope.tweets = [];
    $scope.show_loading = false;
    $scope.show_visualize = false;
    $scope.show_advanced_search = false;
    $scope.visualize_copy = "Visualize";
    $scope.last_query = [];
    $scope.load_more_copy = "View More Tweets";
    $scope.have_searched = false;
    $scope.have_visualized = false;
    $scope.screen_name = sessionStorage.getItem('screen_name');
    $scope.profile_image_url = sessionStorage.getItem('profile_image_url');
    $scope.count_options = [10, 25, 50, 75, 100];
    $scope.radius_options = [1, 5, 15, 50, 100, 500, 1000];
    $scope.sensitive = true;

    // Result Types Array
    $scope.result_types = [{
       name: 'Popular',
       value: 'popular'
    }, {
        name: 'Recent',
        value: 'recent'
    }, {
       name: 'Mixed',
       value: 'mixed'
    }];

    // CSV Column Names Array
    $scope.column_names = [
        { infoMapId: 9,  name: 'Username',        value: 'username',  isChecked: true },
        { infoMapId: 10, name: 'Country',         value: 'country',   isChecked: true },
        { infoMapId: 11, name: 'Location',        value: 'location',  isChecked: true }, 
        { infoMapId: 12, name: 'Timestamp',       value: 'timestamp', isChecked: true }, 
        { infoMapId: 13, name: 'Message',         value: 'message',   isChecked: true }, 
        { infoMapId: 14, name: 'Media',           value: 'media',     isChecked: true }, 
        { infoMapId: 15, name: 'Favorited',       value: 'favorited', isChecked: true }, 
        { infoMapId: 16, name: 'Favorite Count',  value: 'favcount',  isChecked: true }, 
        { infoMapId: 17, name: 'Replied To',      value: 'replyto',   isChecked: true }, 
        { infoMapId: 18, name: 'Total Followers', value: 'followers', isChecked: true }, 
        { infoMapId: 19, name: 'Total Friends',   value: 'friends',   isChecked: true },
        { infoMapId: 19, name: 'Total Favorites', value: 'favorites', isChecked: true }
    ];

    // Default date options
    $scope.dateOptions = { 
        dateFormat: 'yy-mm-dd', 
        minDate: '-7', 
        maxDate: '0D' 
    }


    /*
        @name:    infoDialog
        @author:  Alexander Seeto
        @created: Apr 05, 2015
        @purpose: opens ngDialog and displays info for given string case
        @param:   s - case string
        @reqfile: plugins/infoMap.js
        @return:  
        @errors:
        @modhist: 
    */
    $scope.infoDialog = function(){
        ngDialog.open({
            template: '<div><h1>Helpful Information</h1><h3>'+ infoMap[0].title +'</h3><p>' + infoMap[0].msg + '</p>' 
                        + '<h3>'+ infoMap[1].title +'</h3><p>' + infoMap[1].msg + '</p>'
                        + '<h3>'+ infoMap[2].title +'</h3><p>' + infoMap[2].msg + '</p>'
                        + '<h3>'+ infoMap[3].title +'</h3><p>' + infoMap[3].msg + '</p>'
                        + '<h3>'+ infoMap[4].title +'</h3><p>' + infoMap[4].msg + '</p>'
                        + '<h3>'+ infoMap[5].title +'</h3><p>' + infoMap[5].msg + '</p>'
                        + '<h3>'+ infoMap[6].title +'</h3><p>' + infoMap[6].msg + '</p>'
                        + '<h3>'+ infoMap[7].title +'</h3><p>' + infoMap[7].msg + '</p>'
                        + '<h3>'+ infoMap[8].title +'</h3><p>' + infoMap[8].msg + '</p>'
                        + '<h3>'+ infoMap[9].title +'</h3><p>' + infoMap[9].msg + '</p>'
                        + '<h3>'+ infoMap[10].title +'</h3><p>' + infoMap[10].msg + '</p>'
                        + '<h3>'+ infoMap[11].title +'</h3><p>' + infoMap[11].msg + '</p>'
                        + '<h3>'+ infoMap[12].title +'</h3><p>' + infoMap[12].msg + '</p>'
                        + '<h3>'+ infoMap[13].title +'</h3><p>' + infoMap[13].msg + '</p>'
                        + '<h3>'+ infoMap[14].title +'</h3><p>' + infoMap[14].msg + '</p>'
                        + '<h3>'+ infoMap[15].title +'</h3><p>' + infoMap[15].msg + '</p>'
                        + '<h3>'+ infoMap[16].title +'</h3><p>' + infoMap[16].msg + '</p>'
                        + '<h3>'+ infoMap[17].title +'</h3><p>' + infoMap[17].msg + '</p>'
                        + '<h3>'+ infoMap[18].title +'</h3><p>' + infoMap[18].msg + '</p>'
                        + '<h3>'+ infoMap[19].title +'</h3><p>' + infoMap[19].msg + '</p>'
                        + '<h3>'+ infoMap[20].title +'</h3><p>' + infoMap[20].msg + '</p>'
                        + '</div>',
            plain: true,
            scope: $scope
        });
    }

    /*
        @name:    query
        @author:  Zach Bachiri
        @created: Jan 26, 2015
        @purpose: Builds query parameters and performs twitterCall
        @param:   form_parameters - array of paramter objects
        @reqfile: http://maps.google.com/maps/api/js?sensor=false&libraries=places
        @reqfile: plugins/codebird.js
        @return:  void
        @errors:
        @modhist: Feb 12 : Alex Seeto : Add geocoding
                  Feb 13 : Zach Bachiri : Geocoding modifications
                  Mar 15 : Jimmy Ly : Added switch from visualize view to tweets view
    */
    $scope.query = function(form_parameters){
        // Return to tweets view if visualize view was displayed
        $scope.show_visualize = false;
        $scope.visualize_copy = "Visualize";
        $scope.show_loading = true;
        $scope.have_searched = true;
        $scope.have_visualized = false;
        if (form_parameters.q == "" || typeof form_parameters.q === 'undefined'){
            $scope.show_loading = false;
            $scope.have_searched = false;
            $scope.errorDialog("Please make sure to enter a search term before searching.");
            return;
        }

        // Initializes Google Maps API geocoder
        var geocoder = new google.maps.Geocoder();
        var query_parameters = {};

        // Search Term
        query_parameters.q = form_parameters.q;

        // Tweets returned
        query_parameters.count = form_parameters.count;

        // Language
        query_parameters.lang =  "en";

        // Geocode (defaulted)
        query_parameters.geocode = "";

        query_parameters.result_type = form_parameters.result_type;
        
        // Date Filters
        if(form_parameters.since){
            query_parameters.since = $.datepicker.formatDate('yy-mm-dd', new Date(form_parameters.since));
        }
        if(form_parameters.until){
            query_parameters.until = $.datepicker.formatDate('yy-mm-dd', new Date(form_parameters.until))
        }

        // If a location input is entered
        if(form_parameters.loc != null && form_parameters.loc != "" && geocoder){
            // Convert location input to geolocation
            geocoder.geocode( { 'address': form_parameters.loc}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK){
                var locData = results[0].geometry.location;

                // Set new geocode based off of location input
                query_parameters.geocode = String(locData.lat()) +
                                           ',' +
                                           String(locData.lng()) +
                                           ',' +
                                           form_parameters.radius + 'mi';
                console.log(query_parameters.geocode);
                // Make request with parameters
                twitterCall(query_parameters);
            }
            });
        } else {
            twitterCall(query_parameters);
        }
    };

    /*
        @name:    load_more
        @author:  Zach Bachiri
        @created: Mar 02, 2015
        @purpose: Executes an additional query to load more tweets
        @args:
        @reqfile:
        @return:  void
        @errors:
        @modhist: Mar 24 : Alex Seeto : Add filtering out of possibly sensitive tweets
                  Mar 28 : Jimmy Ly : Add error handling if session expires
                  Mar 30 : Jimmy Ly : Add warning for user if reaching rate limit
    */
    $scope.load_more = function(){
        // Change 'View More Tweets' button display value
        $scope.load_more_copy = "...";
        $.ajax({
            data: $scope.last_query,
            url: flock_server_url + "/tweets",
            success: function(reply){
                // set rate limit information to be displayed
                $scope.rate_limit = reply.rate_limit;
                $scope.rate_limit_remaining = reply.rate_limit_remaining;
                var resetDate = new Date(parseInt(reply.rate_limit_reset) * 1000);
                var hourOffset = resetDate.getTimezoneOffset() / 60;
                resetDate.setHours(resetDate.getHours() - hourOffset);
                $scope.rate_limit_reset = resetDate.toLocaleString();
                // warn user if 10 or 20 searches remaining
                if ($scope.rate_limit_remaining <= 20 && $scope.rate_limit_remaining % 10 === 0){
                    $scope.warningDialog('Only ' + $scope.rate_limit_remaining + ' searches remaining ' +
                                         'before ' + $scope.rate_limit_reset + '.');
                }
                // If true, filter out possibily sensitive tweets, then remove dupes
                if($scope.sensitive){
                    reply.statuses.forEach(function(x){
                        // Push tweet if "possibly_sensitive" is false
                        if(!x.possibly_sensitive){
                            // Push tweet if array does not already contain it
                            if(!contains_tweet($scope.tweets, x)){
                                $scope.tweets.push(x);
                            }
                        }
                    });
                // Otherwise, just filter out dupes
                } else {
                    if(!contains_tweet($scope.tweets, x)){
                        $scope.tweets.push(x);
                    }
                }
                $scope.load_more_copy = "View More Tweets";
                $scope.$apply();
            },
            error: function(error){
                $scope.sessionExpired(error);
            }
        });
    }

    /*
        @name: contains_tweet
        @author: Zach Bachiri
        @created: Mar 02, 2015
        @purpose: returns true if the given array of tweets contains the given tweet; false otherwise
        @param: tweets - array containing a list of tweet objects from Twitter Search API
        @param: tweet - a tweet object being searched for in tweets input
        @return: boolean indicating whether or not the tweets input contains the tweet input
        @errors:
        @modhist:
    */
    var contains_tweet = function(tweets, tweet){
        var contains = false;
        tweets.forEach(function(x){
            if(x.id_str === tweet.id_str){
                contains = true;
            }
        });
        return contains;
    }

    /*
        @name:    twitterCall
        @author:  Zach Bachiri
        @created: Feb 13, 2015
        @purpose: Makes request using Codebird for authentication and Twitter Search API
        @param:   params - array containing parameter objects
        @reqfile:
        @return:  void
        @errors:
        @modhist: Mar 24 : Alex Seeto : Add filtering out of possibly sensitive tweets
                  Mar 30 : Jimmy Ly : Add warning for user if reaching rate limit
    */
    var twitterCall = function(params){
        params.session_id = sessionStorage.sessionId;
        $scope.last_query = params;
        $.ajax({
            data: params,
            url: flock_server_url + "/tweets",
            success: function(reply){
                // set rate limit information to be displayed
                $scope.rate_limit = reply.rate_limit;
                $scope.rate_limit_remaining = reply.rate_limit_remaining;
                var resetDate = new Date(parseInt(reply.rate_limit_reset) * 1000);
                var hourOffset = resetDate.getTimezoneOffset() / 60;
                resetDate.setHours(resetDate.getHours() - hourOffset);
                // warn user if 10 or 20 searches remaining
                $scope.rate_limit_reset = resetDate.toLocaleString();
                if ($scope.rate_limit_remaining < 20 && $scope.rate_limit_remaining % 10 === 0){
                    $scope.warningDialog('Only ' + $scope.rate_limit_remaining + ' searches remaining ' +
                                         'before ' + $scope.rate_limit_reset + '.');
                }

                // If true, filter out possibily sensitive tweets
                if($scope.sensitive && reply.statuses){
                    //HAVE TO SET TWEETS TO BE EMPTY ARRAY FIRST
                    $scope.tweets = [];
                    reply.statuses.forEach(function(x){
                        // Push tweet if "possibly_sensitive" is false
                        if(!x.possibly_sensitive){
                            $scope.tweets.push(x);
                        }
                    });
                }else{
                    $scope.tweets = reply.statuses;
                }

                // Change to default display if no tweets found, give error message
                if ($scope.tweets.length == 0){
                    $scope.show_loading = false;
                    $scope.have_searched = false;
                    $scope.errorDialog("Sorry, no tweets were found for your search term.");
                    return;
                }

                $scope.show_loading = false;
                $scope.$apply();
            },
            error: function(error){
                $scope.sessionExpired(error);
            }
        });
    };

    /*
        @name:    errorDialog
        @author:  Alex Seeto
        @created: Mar 30, 2015
        @purpose: Open ngDialog box containing given error message
        @param:
        @reqfile: plugins/ngDialog.js
        @return:  void
        @errors:
        @modhist:
    */
    $scope.errorDialog = function(msg) {
        ngDialog.open({
            template: '<div><h3>ERROR</h3>' +
                          '<p>' + msg + '</p>' +
                      '</div>',
            plain: true,
            scope: $scope
        });
    }

    /*
        @name:    warningDialog
        @author:  Alex Seeto
        @created: Mar 30, 2015
        @purpose: Open ngDialog box containing given warning message
        @param:
        @reqfile: plugins/ngDialog.js
        @return:  void
        @errors:
        @modhist:
    */
    $scope.warningDialog = function(msg) {
        ngDialog.open({
            template: '<div><h3>WARNING</h3>' +
                          '<p>' + msg + '</p>' +
                      '</div>',
            plain: true,
            scope: $scope
        });
    }

    /*
        @name:    downloadDialog
        @author:  Alex Seeto
        @created: Feb 28, 2015
        @purpose: Open ngDialog box for selecting columns for download
        @param:
        @reqfile: plugins/ngDialog.js
        @return:  void
        @errors:
        @modhist:
    */
    $scope.downloadDialog = function() {
        // Check search has been performed
        if ($scope.tweets.length == 0){
            $scope.errorDialog("Please perform a search before downloading!");
            return;
        }
        ngDialog.open({
            template: '<div><h3>Select Columns to Download </h3>' +
                          '<div ng-repeat="elem in column_names">' +
                              '<input type="checkbox" ng-model="elem.isChecked" id="check-box-{{$index}}" />' +
                              '&nbsp;<span class="info_desc" ng-click="infoDialog(elem.infoMapId)">(+)</span>' +
                              '&nbsp;<label ng-bind="elem.name" for="check-box-{{$index}}"></label>' +
                          '</div>' +
                          '<br />' +
                          '<div>' +
                              '<button id="download" type="button" ng-disabled="!isChecked()" ng-click="download()">Download</button>' +
                          '</div>' +
                      '</div>',
            plain: true,
            scope: $scope
        });
    }

    /*
        @name:    isChecked
        @author:  Alex Seeto
        @created: Mar 02, 2015
        @purpose: returns true if any checkboxes in $scope.column_names are checked
        @param:
        @reqfile:
        @return:  boolean
        @errors:
        @modhist:
    */
    $scope.isChecked = function() {
        for(var e in $scope.column_names) {
            var checkBox = $scope.column_names[e];
            if(checkBox.isChecked)
            return true;
        }
        return false;
    };

    /*
        @name:    download
        @author:  Alex Seeto
        @created: Feb 11, 2015
        @purpose: Parses the json response and downloads into a CSV file
        @param:
        @reqfile:
        @return:  void
        @errors:
        @modhist: Apr 07 : Alex Seeto : Added more metadata to download, fixed message column text cleaning
    */
    $scope.download = function() {
        // Initiate final CSV string
        var CSV = '';

        // Initiate row variable
        var row = "";

        // Initiate column variables
        var username  = '';
        var place     = '';
        var timestamp = '';
        var message   = '';
        var media     = '';
        var favorited = '';
        var favcount  = '';
        var repliedto = '';
        var followers = '';
        var friends   = '';
        var favorites = '';

        // Boolean checks for selected columns
        var checkedUsername = $scope.column_names[0].isChecked;
        var checkedCountry = $scope.column_names[1].isChecked;
        var checkedLocation = $scope.column_names[2].isChecked;
        var checkedTimestamp = $scope.column_names[3].isChecked;
        var checkedMessage = $scope.column_names[4].isChecked;
        var checkedMedia = $scope.column_names[5].isChecked;
        var checkedFavorited = $scope.column_names[6].isChecked;
        var checkedFavCount = $scope.column_names[7].isChecked;
        var checkedRepliedTo = $scope.column_names[8].isChecked;
        var checkedTotalFollowers = $scope.column_names[9].isChecked;
        var checkedTotalFriends = $scope.column_names[10].isChecked;
        var checkedTotalFavorites = $scope.column_names[11].isChecked;

        // Create string of CSV column headers separated by commas
        for(var e in $scope.column_names) {
            var checkBox = $scope.column_names[e];
            if(checkBox.isChecked)
            row+="\"" + checkBox.name + "\",";
        }

        // Remove last comma from String
        row = row.slice(0,-1);

        // Append column header row with line break
        CSV += row + '\r\n';

        // Loop through all tweets
        for (var i = 0; i < $scope.tweets.length; i++){
            var row = "";

            // Set initiated variables parsed from json response
            username  = $scope.tweets[i]["user"]["screen_name"];
            place     = $scope.tweets[i]["place"];
            timestamp = $scope.tweets[i]["created_at"];
            message   = $scope.tweets[i]["text"];
            media     = $scope.tweets[i]["entities"]["media"];
            favorited = $scope.tweets[i]["favorited"];
            favcount  = $scope.tweets[i]["favorite_count"];
            repliedto = $scope.tweets[i]["in_reply_to_screen_name"];
            followers = $scope.tweets[i]["user"]["followers_count"];
            friends   = $scope.tweets[i]["user"]["friends_count"];
            favorites = $scope.tweets[i]["user"]["favourites_count"];

            // Boolean checks for possible null or undefined variables
            var placeCheck = place === null;
            var mediaCheck = typeof media == "undefined";
            var replyCheck = repliedto === null;

            // Convert message to encoded String
            message = message.replace(/\n/g, ' ').replace(/"/g,'""');

            // Separate data with commas, only include data if column's checkbox has been checked
            (checkedUsername)       ? row += '"' + username + '",' : "";
            (checkedCountry)        ? row += '"' + (placeCheck ? "Not Available" : place["country_code"]) + '",' : "";
            (checkedLocation)       ? row += '"' + (placeCheck ? "Not Available" : place["full_name"]) + '",' : "";
            (checkedTimestamp)      ? row += '"' + timestamp + '",' : "";
            (checkedMessage)        ? row += '"' + message + '",' : "";
            (checkedMedia)          ? row += '"' + (mediaCheck ? "Not Available" : media[0]["url"]) + '",' : "";
            (checkedFavorited)      ? row += '"' + favorited + '",' : "";
            (checkedFavCount)       ? row += '"' + favcount + '",' : "";
            (checkedRepliedTo)      ? row += '"' + (replyCheck ? "Not Available" : repliedto) + '",' : "";
            (checkedTotalFollowers) ? row += '"' + followers + '",' : "";
            (checkedTotalFriends)   ? row += '"' + friends + '",' : "";
            (checkedTotalFavorites) ? row += '"' + favorites + '",' : "";

            // Add a line break after each row of data
            CSV += row + '\r\n';
        }

        // Check CSV data exists
        if (CSV == ''){
            $scope.errorDialog("The CSV file does not contain any data.");
            return;
        }

        // Generate a file name
        var fileName = "flockData";

        // Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        // Generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        // Set the visibility hidden so it will not affect web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";

        // Append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /*
        @name:    visualize
        @author:  Zach Bachiri
        @created: Jan 26, 2015
        @purpose: Toggles display of Visualization
        @param:
        @reqfile:
        @return:  void
        @errors:
        @modhist:
    */
    $scope.visualize = function(){
        $scope.show_visualize = !$scope.show_visualize;
        if($scope.show_visualize){
            $scope.visualize_copy = "Tweets";
            if(!$scope.have_visualized){
                // Check search has been performed
                if ($scope.tweets.length == 0){
                    $scope.errorDialog("Please perform a search before visualizing!");
                    return;
                }
                buildCloud();
                build_hashtag_graph();
                build_heatmap();
            }
            $scope.have_visualized = true;
        } else {
            $scope.visualize_copy = "Visualize";
        }
    }

    /*
        @name:    revisualize
        @author:  Alex Seeto
        @created: Apr 10, 2015
        @purpose: Initiates default variables before executing visualize function
        @param:
        @reqfile:
        @return:  void
        @errors:
        @modhist:
    */
    $scope.revisualize = function(){
        $scope.show_visualize = !$scope.show_visualize;
        $scope.visualize();
    }

    /*
        @name:    build_heatmap
        @author:  Zach Bachiri
        @created: Apr 12, 2015
        @purpose: Builds heatmap on top of google maps
        @param:
        @reqfile:
        @return:  void
        @errors:
        @modhist:
    */
    build_heatmap = function(){
        var heatmapData = [];

        $scope.tweets.forEach(function(x){
            if(x.geo){
                var obj = {location: new google.maps.LatLng(x.geo.coordinates[0], x.geo.coordinates[1]), weight: 3};
                heatmapData.push(obj);
            }
        });
        console.log(heatmapData);

        if(heatmapData.length > 0) {
            var center = heatmapData[0].location;
            map = new google.maps.Map(document.getElementById('heatmap'), {
              center: center,
              zoom: 1,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            var heatmap = new google.maps.visualization.HeatmapLayer({
              data: heatmapData
            });
            heatmap.setMap(map);
        } else {
            $("#heatmap").css("display", "none");
        }
    }

    /*
        @name:    buildWordArray
        @author:  Alex Seeto
        @created: Mar 08, 2015
        @purpose: returns array of words from tweets with associated frequency
        @param:
        @reqfile: plugins/underscore.min.js
        @return:  array
        @errors:
        @modhist:
    */
    $scope.buildWordArray = function(){
        // Initiate text variable
        var text = "";

        // Loop through all tweets
        for (var i = 0; i < $scope.tweets.length; i++){
            var row = "";

            // Set initiated variables parsed from json response
            message = $scope.tweets[i]["text"];

            // Convert message to encoded String
            message = message.replace(/[!,\[\]?.":;\n\s]/g,'|||');

            // Separate data with commas
            text += message;
        }

        // Split text into array of words
        var split = text.split("|||");

        // For every text word
        for(var i=0; i<split.length; i++){
            // Convert each string to lowercase
            split[i] = split[i].toLowerCase();
        }

        // Filter out stop words from message array
        var filtered = _.difference(split, stopWords);

        // Group same words and sort by frequency
        var res = 
        _.chain(filtered)
            .without('')
            .groupBy(function(word){return word;})
            .sortBy(function(word){return word.length;})
            .value();

        // Initiate array for each word to be stored with associated frequency
        var wordsArray = [];

        $.each( res, function( index, word ){
           // Object containing each word and word frequency count
           var wordObject = {};
           wordObject.text = word[0].toString();
           wordObject.size = word.length;
           // Creating array of word objects to return
           wordsArray.push(wordObject);
        });

        // Return array of word objects
        return wordsArray;
    }

    /*
        @name:    buid_hashtag_graph
        @author:  Zach Bachiri
        @created: Mar 29, 2015
        @purpose: builds histogram for different number of hashtags
        @param:
        @reqfile:
        @return:
        @errors:
        @modhist:
    */
    build_hashtag_graph = function(){

        // Clear div content
        $('#hashtag_histogram').empty();
        
        var data = [];
        var max = 1;
        $scope.tweets.forEach(function(x){
            x.entities.hashtags.forEach(function(y){
                var hashtag = angular.lowercase(y.text);
                if(data[hashtag]){
                    data[hashtag] = data[hashtag] + 1;
                } else {
                    data[hashtag] = 1;
                }
                if (data[hashtag] > max){
                    max = data[hashtag];
                }
            });
        });

        $('.graph_bar').remove();
        $('.graph_title').remove();

        var tuples = [];

        for (var key in data) tuples.push([key, data[key]]);

        tuples.sort(function(a, b) {
            a = a[1];
            b = b[1];

            return a < b ? -1 : (a > b ? 1 : 0);
        });

        for (var i = 0; i < tuples.length; i++) {
            var key = tuples[i][0];
            var value = tuples[i][1];
            if(value > 1){
                $('#hashtag_histogram').append("<p class='graph_title' style='color:#4C4C4C;margin-bottom:3px;margin-top:15px;'>#"
                                              +key+" - "+value
                                              +"</p>"
                                              +"<div class='graph_bar' style='width:"
                                              +((value/max)*75)
                                              +"%;'></div>");
            }

            // do something with key and value
        }

        // If no hashtags are found, add message
        if($('#hashtag_histogram').is(':empty')){
            $('#hashtag_histogram').text("No hashtags were found that occurred more than once within search results.");
        } 
    }


    /*
        @name:    wordcloud
        @author:  Alex Seeto
        @created: Mar 09, 2015
        @purpose: passes array of words into calculateCloud
        @param:
        @reqfile:
        @return:
        @errors:
        @modhist:
    */
    buildCloud = function(){
        // Initiate text variable
        var wordsArray = $scope.buildWordArray();
        $scope.calculateCloud(wordsArray);
    }

    /*
        @name:    calculateCloud
        @author:  Alex Seeto
        @created: Mar 09, 2015
        @purpose: makes necessary calculations before starting drawCloud
        @param:   data  - array of word objects
        @reqfile: plugins/d3.js
        @return:
        @errors:
        @modhist:
    */
    $scope.calculateCloud = function(data){
        // Scale for font size
        var sizeScale = d3.scale.linear().domain([0, 50]).range([10, 50]);

        // Start cloud calculations
        d3.layout.cloud()
        .size([800, 300])
        .words(data)
        .padding(1)
        .rotate(function() { return 0})
        .fontSize(function(d) { return sizeScale(d.size+20); })
        .on('end', $scope.drawCloud)
        .text(function(d) { return d.text; })
        .start();
    }

    /*
        @name:    drawCloud
        @author:  Alex Seeto
        @created: Mar 09, 2015
        @purpose: appends svg object to #cloud div
        @param:   words - array of word objects
        @reqfile: plugins/d3.js
        @reqfile: plugins/d3.layout.cloud.js
        @return:
        @errors:
        @modhist:
    */
    $scope.drawCloud = function(words){
        // Scale for font size
        var sizeScale = d3.scale.linear().domain([0, 50]).range([10, 50]);

        d3.select('svg').remove();
        d3.select("#cloud").append("svg")
                          .attr("width", 800)
                          .attr("height", 300)
                          .append("g")
                          // Center g Element within Canvas (halve sizes from calculateCloud)
                          .attr("transform", "translate(400,150)")
                          .selectAll("text")
                          .data(words)
                          .enter().append("text")
                          .style("font-size", function(d) { return sizeScale(d.size-20) + "px"; })
                          .style("font-family", "Lucida Grande")
                          .style("fill", function(d, i) { i })
                          .attr("text-anchor", "middle")
                          .attr("transform", function(d) {
                              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                          })
                          .text(function(d) { return d.text; });
    }

    /*
        @name:    downloadCloud
        @author:  Alex Seeto
        @created: Mar 09, 2015
        @purpose: Converts canvas context to PNG, creates temp link to download
        @param:
        @reqfile:
        @return:
        @errors:
        @modhist:
    */
    $scope.downloadCloud = function(){
        // Check search has been performed
        if ($('#cloud').children().length == 0){
            $scope.errorDialog("Please generate a word cloud before downloading!");
            return;
        }
        var svg = document.querySelector("svg");
        var svgData = new XMLSerializer().serializeToString( svg );

        var canvas = document.createElement("canvas");
        canvas.width = "800";
        canvas.height = "300";
        var ctx = canvas.getContext("2d");
        var img = document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa( unescape(encodeURIComponent(svgData)) ) );

        img.onload = function() {
            ctx.drawImage( img, 0, 0 );
            var url = canvas.toDataURL( "image/png" );
            // Generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = url;

            // Set the visibility hidden so it will not affect web-layout
            link.style = "visibility:hidden";
            link.download = "flockcloud.png";

            // Append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    /*
        @name:    autosuggest
        @author:  Alex Seeto
        @created: Feb 17, 2015
        @purpose: Uses Google Maps API and places library to form autocomplete for location input
        @param:
        @reqfile: http://maps.google.com/maps/api/js?sensor=false&libraries=places
        @return:  void
        @errors:
        @modhist:
    */
    $scope.autosuggest = function(){
        var place;
        var autocomplete = new google.maps.places.Autocomplete(loc_text);
        google.maps.event.addListener(autocomplete, 'place_changed', function (){
            place = autocomplete.getPlace().formatted_address;
            $("#loc_text").html(place);
            $("#loc_text").trigger('input').trigger('change').trigger('keydown');;
        });
    }

    /*
        @name:    toggle_advanced_search
        @author:  Zach Bachiri
        @created: Feb 18, 2015
        @purpose: Toggles display of advanced search options
        @param:
        @reqfile:
        @return:  void
        @errors:
        @modhist:
    */
    $scope.toggle_advanced_search = function(){
        $scope.show_advanced_search = !$scope.show_advanced_search;
    }

    $scope.sessionExpired = function(error){
        if (error.status === 403){
            $scope.errorDialog('Sorry, your session has expired. Please login again.');
            sessionStorage.clear();
            $state.go('login');
        } else {
            console.log(error);
        }
    }

    $scope.logout = function(){
        sessionStorage.clear();
        $state.go('login');
    }
});
