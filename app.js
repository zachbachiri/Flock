(function(){
	var app = angular.module('twitterTool', ['masonry']);

	var cb = new Codebird;
	cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
	cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

	/* Main Controller */
	app.controller('MainController', function($scope, $q){
		$scope.tweets = [];
		
		
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


		//NOTE: if we want to allow free text location search, like boston, ma, 
		//      we need to use a geocoder, like https://developers.google.com/maps/documentation/javascript/geocoding
		$scope.query = function(params) {
			if (params.q == "") {
				return;
			}

			params.count = 100;
			params.lang = "en";

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

    		//this trick will generate a temp <a /> tag
		    var link = document.createElement("a");    
		    link.href = uri;
		    
		    //set the visibility hidden so it will not effect on your web-layout
		    link.style = "visibility:hidden";
		    link.download = fileName + ".csv";
		    
		    //this part will append the anchor tag and remove it after automatic click
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
	    }

	    $scope.visualize = function() {
	    	console.log("Visualize");  
	    }  
	});
  
})();

