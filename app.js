(function(){
	// var app = angular.module('twitterTool', ['masonry'], ['ngDialog']);
	var app = angular.module('twitterTool', ['masonry']);

	var cb = new Codebird;
	cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
	cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

    /* Main Controller */
	app.controller('MainController', function($scope, $q){
		$scope.tweets = [];
		$scope.show_loading = false;
		$scope.show_visualize = false;
		$scope.show_advanced_search = false;
		$scope.visualize_copy = "Visualize";

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

	    /* Parses the json response and downloads into a CSV file */
		$scope.query = function(form_parameters) {
			$scope.show_loading = !$scope.show_loading;
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

	    /* Makes request using Codebird for authentication and Twitter Search API */
	    var twitterCall = function(params){
	    	cb.__call(
				"search_tweets",
				params,
				function (reply) {
					$scope.tweets = reply.statuses;
					$scope.show_loading = !$scope.show_loading;
					$scope.$apply();
				}
			);
	    }

	    /* Parses the json response and downloads into a CSV file */
	    $scope.download = function() {
	    	// ngDialog.open({
		    //     template: '<div>By updating i need it to reflect in the root scope:<br /><br />' + 
		    //               '<input type="text" ng-model="passedObject"/></div>',
		    //     plain: true,
		    //     scope: $scope,
		    //     controller: ['$scope', function($scope){
		    //         $scope.$watch('passedObject', function(passedObject){
		    //             //What do i need to do? it seems like the scope at this level is updating how come the parent is not?
		    //             if(window.console){console.log('updated with: ' + passedObject);}
		    //             //$scope.$apply();
		    //         });
		    //     }]
		    // });
	    	// Check CSV data exists
		    if ($scope.tweets == []) {        
		        alert("Please perform a search before downloading!");
		        return;
		    }

	        // Initiate final CSV string
	    	var CSV = '';

	    	// Initiate row variable
	    	var row = "";

	    	// Initiate column variables
	        var username  = '';
	        var place  	  = '';
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
		        place  	  = $scope.tweets[i]["place"];
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

		/* Toggles display of Visualization */
	    $scope.visualize = function() {
	    	$scope.show_visualize = !$scope.show_visualize;
	    	if($scope.visualize_copy == "Visualize") {
	    		$scope.visualize_copy = "Tweets";
	    	} else {
	    		$scope.visualize_copy = "Visualize";
	    	}
	    }

		/* Uses Google Maps API and places library to form autocomplete for location input */
		$scope.autosuggest = function() {
			var place;
			var autocomplete = new google.maps.places.Autocomplete(loc_text);
			google.maps.event.addListener(autocomplete, 'place_changed', function (){
		        place = autocomplete.getPlace();
			});
		}

		/* Toggles display of advanced search options */
		$scope.toggle_advanced_search = function() {
			$scope.show_advanced_search = !$scope.show_advanced_search;
		}
	});
  
})();

