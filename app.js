(function(){
	var app = angular.module('twitterTool', []);

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
	    	console.log("Download");
	    }

	    $scope.visualize = function() {
	    	console.log("Visualize");  
	    }  
	});
  
})();

