/*
    @author:  Jimmy Ly
    @created: February 23, 2015
    @group:   #11
    @purpose: Provide Jasmine unit tests for the MainController.
              Most of the code is encapsulated, so only the publicly
              accessible code is tested.
*/

// Test suite for the MainController
describe('MainController', function() {

    // Load the main app module before each spec
    //beforeEach(module('twitterTool'));

    /* ------------------------------------------ */


    var $rootScope, $state, $injector;

    beforeEach(function() {

        module('twitterTool');

        inject(function(_$rootScope_, _$state_, _$injector_, $templateCache) {
          $rootScope = _$rootScope_;
          $state = _$state_;
          $injector = _$injector_;

          // We need add the template entry into the templateCache if we ever
          // specify a templateUrl
          $templateCache.put('partials/search.html', '');
          $templateCache.put('partials/login.html', '');
        })

        $state.go('search');
      });

    it('should test redirect to login page without session', inject(function($controller, $state) {
        expect($state.href('login')).toBe('/login');
    }));

    /* ------------------------------------------ */

    // Test the state of the application before making a query
    it('should test initialization of variables', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        // make sure the scope variables are initialized properly
        expect(scope.tweets).toEqual([]);
        expect(scope.show_loading).toBe(false);
        expect(scope.show_visualize).toBe(false);
        expect(scope.show_advanced_search).toBe(false);
        expect(scope.visualize_copy).toBe("Visualize");
        expect(scope.last_query).toEqual([]);
        expect(scope.load_more_copy).toBe("View More Tweets");
        expect(scope.have_searched).toBe(false);
        expect(scope.have_visualized).toBe(false);
        expect(scope.count_options).toEqual([10, 25, 50, 75, 100]);

        var expected_result_types = [{
            name: 'Popular',
            value: 'popular'
        }, {
            name: 'Recent',
            value: 'recent'
        }, {
            name: 'Mixed',
            value: 'mixed'
        }];

        expect(scope.result_types).toEqual(expected_result_types);

        var expected_date_options = {
            dateFormat: 'yy-mm-dd',
            minDate: '-7',
            maxDate: '0D'
        }

        expect(scope.dateOptions).toEqual(expected_date_options);


        var expected_column_names = [
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

        expect(scope.column_names).toEqual(expected_column_names);

    }));

    // Test the state of the application when making a query
    it('should test variables when making queries', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        form_parameters = {
            q: "oscars",
            loc: "",
            result_type: "popular",
            count: 100
        };
        scope.query(form_parameters);

        expect(scope.show_visualize).toBe(false);
        expect(scope.visualize_copy).toBe("Visualize");
        expect(scope.show_loading).toBe(true);
        expect(scope.have_searched).toBe(true);
        expect(scope.have_visualized).toBe(false);

        expect(scope.last_query.q).toBe("oscars");
        expect(scope.last_query.geocode).toBe("");
        expect(scope.last_query.count).toBe(100);
        expect(scope.last_query.lang).toBe("en");
        expect(scope.tweets.length).toBe(0);
    }));

    // Test the advanced search toggle function
    it('should test the advanced search toggle', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        expect(scope.show_advanced_search).toBe(false);
        scope.toggle_advanced_search();
        expect(scope.show_advanced_search).toBe(true);
        scope.toggle_advanced_search();
        expect(scope.show_advanced_search).toBe(false);

    }));

    // Test the load_more function
    it('should test the load_more function', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        expect()
    }));

    // Test the visualize function
    it('should test the visualize function', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });
        scope.tweets = [{
                           "text":"Test Tweet 1",
                           "user":{
                               "name":"Test User1",
                               "screen_name":"TestUser1",
                               "profile_image_url_https":"https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png",
                           },
                           "entities":{
                               "hashtags": ["foo", "bar"]
                           }
                       }];
        expect(scope.show_visualize).toBe(false);
        expect(scope.visualize_copy).toBe('Visualize');
        scope.visualize();
        expect(scope.show_visualize).toBe(true);
        expect(scope.visualize_copy).toBe('Tweets');
        expect(scope.have_visualized).toBe(true);
    }));

    it('should test the revisualize function', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });
        scope.tweets = [{
                           "text":"Test Tweet 1",
                           "user":{
                               "name":"Test User1",
                               "screen_name":"TestUser1",
                               "profile_image_url_https":"https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png",
                           },
                           "entities":{
                               "hashtags": ["foo", "bar"]
                           }
                       }];
        expect(scope.show_visualize).toBe(false);
        expect(scope.visualize_copy).toBe('Visualize');
        scope.revisualize();
        expect(scope.show_visualize).toBe(false);
        expect(scope.visualize_copy).toBe('Visualize');
        expect(scope.have_visualized).toBe(false);
    }));

    // Test the isChecked function
    it('should test the isChecked function', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        scope.column_names = [
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

        for (var e in scope.column_names) {
            expect(scope.isChecked()).toBe(true);
            scope.column_names[e].isChecked = false;
        }
        expect(scope.isChecked()).toBe(false);
    }));

    it('should test the logout function', inject(function($controller, $state) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        $state.go('search');
        $rootScope.$digest();
        expect($state.is('search')).toBe(true);
        scope.logout();
        $rootScope.$digest();
        expect($state.is('login')).toBe(true);
    }));
});

describe('LoginController', function() {

    // Load the main app module before each spec
   var $rootScope, $state, $injector;

    beforeEach(function() {

        module('twitterTool');

        inject(function(_$rootScope_, _$state_, _$injector_, $templateCache) {
          $rootScope = _$rootScope_;
          $state = _$state_;
          $injector = _$injector_;

          // We need add the template entry into the templateCache if we ever
          // specify a templateUrl
          $templateCache.put('partials/search.html', '');
          $templateCache.put('partials/login.html', '');
        })

        $state.go('login');
      });

      it('should test the twitter_sign_in function', inject(function($controller, $state) {
          var scope = {},
              ctrl = $controller('LoginController', { $scope: scope });

          scope.guest_sign_in();
          $rootScope.$digest();
      }));

});

describe('RedirectController', function() {
    beforeEach(function() {
        module('twitterTool');
        //$location.absUrl() = "http://www.google.com";
       // window.location.href="http://www.northeastern.edu/flock/?oauth_token=foo&oauth_verifier=bar#/redirect";
      //  console.log(window.location.href);
    });

    it('should test redirect_error', inject(function($controller, $location) {
        //var scope = {},
          //  ctrl = $controller('RedirectController', { $scope: scope });
        //window.location.href = "http://www.northeastern.edu/flock/?oauth_token=foo&oauth_verifier=bar#/redirect";
        //scope.redirect_error();


    }));
});