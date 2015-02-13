(function(){
	var app = angular.module('twitterTool', ['masonry']);

	var cb = new Codebird;
	cb.setConsumerKey("pEaf5TgKTpz0Tf1M9uyqZSysQ", "dTV7OuEkgauN8syVrOT5T9XzK8CnXpSvjMEELlZshz1aqdsAVW");
	cb.setToken("3029162194-GAze2tNS3Y4rPvIwvXZ1j813hZriXKWNpWjo3dd", "ndsckIxbSpvDuTZGdmzP4pGac6fsBjfQAVkL5EoTzpd3M");

	/* Main Controller */
	app.controller('MainController', function($scope, $q){
		$scope.tweets = [];

		$scope.query = function(form_parameters) {
			if (form_parameters.q == "") {
				return;
			}
			
			var geocoder = new google.maps.Geocoder();
			var query_parameters = [];
			query_parameters.q = form_parameters.q;
			query_parameters.count = 100;
			query_parameters.lang =  "en";
			
			if(form_parameters.loc != null && form_parameters.loc != ""){
				if(geocoder){
					//convert location input to geolocation
					geocoder.geocode( { 'address': form_parameters.loc}, function(results, status){
				        if (status == google.maps.GeocoderStatus.OK){
				        	var locData = results[0].geometry.location;

				        	query_parameters.geocode = String(locData.lat()) + 
				        						   ',' + 
				        						   String(locData.lng()) + 
				        						   ',' + 
				        						   '25mi';

				        	cb.__call(
								"search_tweets",
								query_parameters,
								function (reply) {
									//now you can see that all tweets have a geo object
									console.log(reply.statuses);
									$scope.tweets = reply.statuses;
									$scope.$apply();
								}
							);
				        }else{
				        	cb.__call(
								"search_tweets",
								query_parameters,
								function (reply) {
									console.log(reply.statuses);
									$scope.tweets = reply.statuses;
									$scope.$apply();
								}
							);
				            console.log("Geocode unsuccessful, Status: " + status);
				        }
			    	});
				}
			}
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

