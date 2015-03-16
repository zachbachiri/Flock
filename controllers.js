/*
    @author:  Zach Bachiri
    @created: Jan 26, 2015
    @group:   #11
    @purpose: Initiate Angular Modules and Controller
*/
(function(){
    var app = angular.module('twitterTool', ['masonry', 'ngDialog']);

    // For Twitter application-authenticated service calls
    var cb = new Codebird;
    cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
    cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

    /*
        @author:  Zach Bachiri
        @created: Jan 26, 2015
        @purpose: Initiate Main Controller
        @param:   $scope - object required for angular usage
        @param:   $q - string, search term
        @param:   ngDialog - ngDialog object
        @return:  void
    */
    app.controller('MainController', function($scope, $q, ngDialog){
        // Set default variable values
        $scope.tweets = [];
        $scope.show_loading = false;
        $scope.show_visualize = false;
        $scope.show_advanced_search = false;
        $scope.visualize_copy = "Visualize";
        $scope.last_query = [];
        $scope.load_more_copy = "View More Tweets";
        $scope.have_searched = false;
        $scope.count_options = [];
        for (i = 1; i <= 100; i++) {
            $scope.count_options.push(i);
        }

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
        $scope.column_names = [{
            name: 'Username',
            value: 'username',
            isChecked: true
        }, {
            name: 'Country',
            value: 'country',
            isChecked: true
        }, {
            name: 'Location',
            value: 'location',
            isChecked: true
        }, {
            name: 'Timestamp',
            value: 'timestamp',
            isChecked: true
        }, {
            name: 'Message',
            value: 'message',
            isChecked: true
        }, {
            name: 'Media',
            value: 'media',
            isChecked: true
        }];

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
        */
        $scope.query = function(form_parameters){
            $scope.show_loading = true;
            $scope.have_searched = true;
            if (form_parameters.q == ""){
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
                                               '50mi';
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
            @modhist:
        */
        $scope.load_more = function(){
            // Change 'View More Tweets' button display value
            $scope.load_more_copy = "...";
            cb.__call(
                "search_tweets",
                $scope.last_query,
                function (reply){
                    console.log(reply.statuses);
                    reply.statuses.forEach(function(x){
                        if(!contains_tweet($scope.tweets, x)){ //doesn't work, need to find if array contains
                            $scope.tweets.push(x);
                        }
                    })
                    $scope.load_more_copy = "View More Tweets";
                    $scope.$apply();
                }
            );
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
            tweets.forEach(function(x){
                if(x.id == tweet.id){
                    return true;
                }
            });
            return false;
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
            @modhist:
        */
        var twitterCall = function(params){
            $scope.last_query = params;
            cb.__call(
                "search_tweets",
                params,
                function (reply){
                    $scope.tweets = reply.statuses;
                    $scope.$apply();
                    $scope.show_loading = false;
                }
            );
        };

        /*
            @name:    showNgDialog
            @author:  Alex Seeto
            @created: Feb 28, 2015
            @purpose: Show ngDialog box for selecting columns for download
            @param:
            @reqfile: plugins/ngDialog.js
            @return:  void
            @errors:
            @modhist:
        */
        $scope.showNgDialog = function() {
            // Check search has been performed
            if ($scope.tweets.length == 0){
                alert("Please perform a search before downloading!");
                return;
            }
            ngDialog.open({
                template: '<div><h3>Select Columns to Download </h3>' +
                              '<div ng-repeat="elem in column_names">' +
                              '<input type="checkbox" ng-model="elem.isChecked" id="check-box-{{$index}}" />' +
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
            @modhist:
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

            // Boolean checks for selected columns
            var checkedUsername = $scope.column_names[0].isChecked;
            var checkedCountry = $scope.column_names[1].isChecked;
            var checkedLocation = $scope.column_names[2].isChecked;
            var checkedTimestamp = $scope.column_names[3].isChecked;
            var checkedMessage = $scope.column_names[4].isChecked;
            var checkedMedia = $scope.column_names[5].isChecked;

            // Create string of CSV column headers separated by commas
            for(var e in $scope.column_names) {
                var checkBox = $scope.column_names[e];
                if(checkBox.isChecked)
                row+=checkBox.name + ",";
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

                // Boolean checks for possible null or undefined variables
                var placeCheck = place === null;
                var mediaCheck = typeof media == "undefined";

                // Convert message to encoded String
                message = escape(message);

                // Separate data with commas
                (checkedUsername)   ?     row += '"' + username + '",' : "";
                (checkedCountry)    ?     row += '"' + (placeCheck ? "Not Available" : place["country_code"]) + '",' : "";
                (checkedLocation)   ?     row += '"' + (placeCheck ? "Not Available" : place["full_name"]) + '",' : "";
                (checkedTimestamp)  ?     row += '"' + timestamp + '",' : "";
                (checkedMessage)    ?     row += '"' + message + '",' : "";
                (checkedMedia)      ?     row += '"' + (mediaCheck ? "Not Available" : media[0]["url"]) + '",' : "";

                // Add a line break after each row of data
                CSV += row + '\r\n';
            }

            // Check CSV data exists
            if (CSV == ''){
                alert("Invalid data");
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
            if($scope.visualize_copy == "Visualize"){
                $scope.visualize_copy = "Tweets";
            } else {
                $scope.visualize_copy = "Visualize";
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
        $scope.buildCloud = function(){
            // Check search has been performed
            if ($scope.tweets.length == 0){
                alert("Please perform a search before building a word cloud!");
                return;
            }
            // Initiate text variable
            var wordsArray = $scope.frequencycount();
            $scope.calculateCloud(wordsArray);
        }

        /*
            @name:    frequencycount
            @author:  Alex Seeto
            @created: Mar 08, 2015
            @purpose: returns array of words from tweets with associated frequency
            @param:
            @reqfile: plugins/underscore.min.js
            @return:  array
            @errors:
            @modhist:
        */
        $scope.frequencycount = function(){
            // Initiate text variable
            var text = "";

            // Loop through all tweets
            for (var i = 0; i < $scope.tweets.length; i++){
                var row = "";

                // Set initiated variables parsed from json response
                message = $scope.tweets[i]["text"];

                // Convert message to encoded String
                message = message.replace(/[!,?.":;]/g,' ');

                // Separate data with commas
                text += message;
            }

            // Split text into array of words
            var split = text.split(" ");

            // Group same words and sort by frequency
            var res =
            _.chain(split)
                .without('',' ','a','A','an','An','and','any','Any','are','Are','as','As',
                         'that','That','The','the','this','This','of','for','For','to',
                         'with','is','in','on','our','Our', 'RT', '&amp', '//t', 'http', 'I\'m', 'I')
                .groupBy( function(word){return word;} )
                .sortBy(  function(word){ return word.length; } )
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
            var sizeScale = d3.scale.linear()
                            .domain([0, 50])
                            .range([10, 95]);

            // Start cloud calculations
            d3.layout.cloud()
            .size([800, 300])
            .words(data)
            .rotate(function() { return ~~(Math.random()*2) * 90;}) // 0 or 90deg
            .fontSize(function(d) { return sizeScale(d.size); })
            .on('end', $scope.drawCloud)
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
            var fill = d3.scale.category20();
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
                              .style("font-size", function(d) { return d.size + "px"; })
                              .style("font-family", "Impact")
                              .style("fill", function(d, i) { return fill(i); })
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
                alert("Please generate a word cloud before downloading!");
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
                place = autocomplete.getPlace();
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
    });

})();

