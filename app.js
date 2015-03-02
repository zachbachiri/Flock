/*
    @author:  Zach Bachiri
    @created: Jan 26, 2015
    @group:   #11
    @purpose: Initiate Angular Modules and Controller
*/
(function(){
    var app = angular.module('twitterTool', ['masonry']);

    var cb = new Codebird;
    cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
    cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

    /*
        @author:  Zach Bachiri
        @created: Jan 26, 2015
        @purpose: Initiate Main Controller
        @args:    $scope, $q // TODO: add arg type
        @return:  void 
    */
    app.controller('MainController', function($scope, $q){
        $scope.tweets = [];
        $scope.show_loading = false;
        $scope.show_visualize = false;
        $scope.show_advanced_search = false;
        $scope.visualize_copy = "Visualize";
        $scope.last_query = [];
        $scope.load_more_copy = "View More Tweets";
        $scope.have_searched = false;

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

        /* 
            @name:    query
            @author:  Zach Bachiri
            @created: Jan 26, 2015
            @purpose: Builds query parametes and performs twitterCall 
            @args:    $scope, $q // TODO: add arg type
            @reqfile: 
            @return:  void
            @errors:  
            @modhist: Feb 12 : Alex Seeto : Add geocoding
                      Feb 13 : Zach Bachiri : Geocoding modifications
        */
        $scope.query = function(form_parameters) {
            $scope.show_loading = true;
            $scope.have_searched = true;
            if (form_parameters.q == "") {
                return;
            }
            
            // Initializes Google Maps API geocoder
            var geocoder = new google.maps.Geocoder();
            var query_parameters = [];

            // Search Term
            query_parameters.q = form_parameters.q;
            
            // Tweets returned
            query_parameters.count = 100;

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


        $scope.load_more = function(){
            $scope.load_more_copy = "...";
            cb.__call(
                "search_tweets",
                $scope.last_query,
                function (reply) {
                    reply.statuses.forEach(function(x) {
                        if(!contains_tweet($scope.tweets, x)){ //doesn't work, need to find if array contains
                            $scope.tweets.push(x);
                        }
                    })
                    console.log("done");
                    $scope.load_more_copy = "View More Tweets";
                    $scope.$apply();
                }
            );
        }
 
        var contains_tweet = function(tweets, tweet){
            var contains = false;
            tweets.forEach(function(x){
                if(x.id == tweet.id){
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
            @args:    params // TODO: add arg type
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
                function (reply) {
                    $scope.tweets = reply.statuses;
                    $scope.show_loading = !$scope.show_loading;
                    $scope.$apply();
                    $scope.show_loading = false;
                }
            );
        }

        /* 
            @name:    showNgDialog
            @author:  Alex Seeto
            @created: Feb 28, 2015
            @purpose: Show ngDialog box for selecting columns for download 
            @args:    
            @reqfile: plugins/ngDialog.js
            @return:  void
            @errors:  
            @modhist: 
        */
        $scope.showNgDialog = function() {
            // ngDialog.open({
            //     template: '<div>Select Columns to Download<br /><br />' + 
            //               '</div>',
            //     plain: true,
            //     scope: $scope
            // });
        }

        /* 
            @name:    download
            @author:  Alex Seeto
            @created: Feb 11, 2015
            @purpose: Parses the json response and downloads into a CSV file
            @args:    
            @reqfile: 
            @return:  void
            @errors:  
            @modhist: 
        */
        $scope.download = function() {
            // Check CSV data exists
            if ($scope.tweets.length == 0) {        
                alert("Please perform a search before downloading!");
                return;
            }

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

            // Array of CSV column headers
            row += "Username,Country,Location,Timestamp,Message,Image";
            
            // Append column header row with line break
            CSV += row + '\r\n';

            // Loop through all tweets
            for (var i = 0; i < $scope.tweets.length; i++) {
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
                row += '"' + username + '",';
                row += '"' + (placeCheck ? "Not Available" : place["country_code"]) + '",';
                row += '"' + (placeCheck ? "Not Available" : place["full_name"]) + '",';
                row += '"' + timestamp + '",';
                row += '"' + message + '",';
                row += '"' + (mediaCheck ? "Not Available" : media[0]["url"]) + '",';
                
                // Add a line break after each row of data
                CSV += row + '\r\n';
            }

            // Check CSV data exists
            if (CSV == '') {        
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
            @args:    
            @reqfile: 
            @return:  void
            @errors:  
            @modhist: 
        */
        $scope.visualize = function() {
            $scope.show_visualize = !$scope.show_visualize;
            if($scope.visualize_copy == "Visualize") {
                $scope.visualize_copy = "Tweets";
            } else {
                $scope.visualize_copy = "Visualize";
            }
        }

        /* 
            @name:    autosuggest
            @author:  Alex Seeto
            @created: Feb 17, 2015
            @purpose: Uses Google Maps API and places library to form autocomplete for location input
            @args:    
            @reqfile: http://maps.google.com/maps/api/js?sensor=false&libraries=places
            @return:  void
            @errors:  
            @modhist: 
        */
        $scope.autosuggest = function() {
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
            @args:    
            @reqfile: 
            @return:  void
            @errors:  
            @modhist: 
        */
        $scope.toggle_advanced_search = function() {
            $scope.show_advanced_search = !$scope.show_advanced_search;
        }
    });
  
})();

