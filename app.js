(function(){
	var app = angular.module('twitterTool', ['masonry']);

	var cb = new Codebird;
	cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
	cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

	//Initialize geocoder
	var geocoder = new google.maps.Geocoder();

	/* Main Controller */
	app.controller('MainController', function($scope, $q){
		$scope.tweets = [];
		$scope.loc = {};
		
		var query_api = function(params){
			var tweets;
			cb.__call(
			"search_tweets",
			params,
			function (reply) {
				tweets = reply.statuses;
			});
			return tweets;
		}

		$scope.setGeolocation = function(location){
			//convert location input to geolocation
			geocoder.geocode( { 'address': location}, function(results, status){
		        if (status == google.maps.GeocoderStatus.OK){
		            $scope.loc = results[0].geometry.location;
		            $scope.$apply();
		        }else{
		            alert("Geocode unsuccessful, Status: " + status);
		        }
		    });
		}

		$scope.query = function(params) {
			if (params.q == "") {
				return;
			}
			
			//Get user location input
			var location = $('#location').val();
			//Get latitude, longitude using geocoder
			$scope.setGeolocation(location);
			console.log($scope.loc);

			params.count = 100;
			params.lang = "en";
			// params.lat = $scope.loc.lat();
			// params.long = $scope.loc.lng();

			cb.__call(
				"search_tweets",
				params,
				function (reply) {
					$scope.tweets = reply.statuses;
					$scope.$apply();
				}
			);
			
	    };

	    //Placeholder functions for downloading and visualizing
	    $scope.download = function() {
	    	
	    	var CSV = '';
	    	var row = "";

			//Array of CSV column headers
			row += "Username,Timestamp,Message,"; 
			row = row.slice(0, -1);
			
			//Append column header row with line break
			CSV += row + '\r\n';

			//Loop through all tweets
		    for (var i = 0; i < $scope.tweets.length; i++) {
		        var row = "";
		        
		        //Extract specifc data for each tweet
		        row += '"' + $scope.tweets[i]["user"]["screen_name"] + '",';
		        row += '"' + $scope.tweets[i]["created_at"] + '",';
		        row += '"' + $scope.tweets[i]["text"] + '",';
		        row.slice(0, row.length - 1);
		        
		        //Add a line break after each row
		        CSV += row + '\r\n';
		    }

		    if (CSV == '') {        
		        alert("Invalid data");
		        return;
		    }
			
			//Generate a file name
		    var fileName = "flockData";
		    
		    //Initialize file format you want csv or xls
    		var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    		//Generate a temp <a /> tag
		    var link = document.createElement("a");    
		    link.href = uri;
		    
		    //Set the visibility hidden so it will not affect web-layout
		    link.style = "visibility:hidden";
		    link.download = fileName + ".csv";
		    
		    //Append the anchor tag and remove it after automatic click
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
	    }

	    $scope.visualize = function() {
	    	console.log("Visualize");  
	    }  
	});
  
})();

