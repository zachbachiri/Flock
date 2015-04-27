/*
    @author:  Jimmy Ly
    @created: February 23, 2015
    @group:   #11
    @purpose: Provide Jasmine unit tests for the MainController.
              Most of the code is encapsulated, so only the publicly
              accessible code is tested.
*/

// Encrypted Guest access token and access token secret
var guestAccessToken = '31c4e57b83e28607356f878e10162774ef874f2dd0f84b5484376e7ff8f5f0894df8604b27ad' +
                       'd2aa066fd9b8c542b4c65f5df3beae3d089cef2a2963a00dfe36';
var guestAccessSecret = 'd3c46a874b4a8b82c9d1f6625e9ecf33ee49e074e48e3753a27cd35ccd4e80f5fb953efa77c' +
                        '0e8accdf561d259ae133e';

// Test suite for the MainController
describe('MainController', function() {

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

        // Start at the search page
        $state.go('search');
      });

    // On page load, the default variable settings are correctly set to empty,
    // default HTML text (i.e. View More Tweets and Visualize),  or false respectively.
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

        // Test the initial result types value
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

        // Test the initial date variable value
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
            { infoMapId: 20, name: 'Total Favorites', value: 'favorites', isChecked: true }
        ];

        expect(scope.column_names).toEqual(expected_column_names);

    }));

    // Created dummy “form_parameters” to be passed into $scope.query() and ensured
    // that parameters are being set correctly (i.e. when checking last executed query,
    // we found that the search term is correctly be set as the q attribute of the object
    // and also that the loading block toggles to become visible.
    it('should test variables when making queries', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        form_parameters = {
            q: "oscars",
            loc: "",
            result_type: "popular",
            count: 100
        };

        // set Guest access token/secret cookies required for the query
        setCookie('at', guestAccessToken);
        setCookie('ats', guestAccessSecret);

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

    // Advanced Search options are first hidden and successfully toggles
    // $scope.show_advanced_search boolean when $scope.toggle_advanced_search() is executed.
    it('should test the advanced search toggle', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        expect(scope.show_advanced_search).toBe(false);
        scope.toggle_advanced_search();
        expect(scope.show_advanced_search).toBe(true);
        scope.toggle_advanced_search();
        expect(scope.show_advanced_search).toBe(false);

    }));

    // Test the visualize functions. The visualization
    // variables should change after calling visualize
    it('should test the visualize function', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        // Set a sample tweet in the controller
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

        // Test the initial state of the visualization variables
        expect(scope.show_visualize).toBe(false);
        expect(scope.visualize_copy).toBe('Visualize');

        // Test that once a search has been made, then the visualization view will display when toggled
        scope.visualize();
        expect(scope.show_visualize).toBe(true);
        expect(scope.visualize_copy).toBe('Tweets');
        expect(scope.have_visualized).toBe(true);
    }));

    // Test the isChecked function such that if any of the columns in column_names is checked,
    // then isChecked returns true. After unchecking all of the columns, isChecked should
    // return false
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
            { infoMapId: 20, name: 'Total Favorites', value: 'favorites', isChecked: true }
        ];

        // Test that isChecked is true, then uncheck a column until all are unchecked
        for (var e in scope.column_names) {
            expect(scope.isChecked()).toBe(true);
            scope.column_names[e].isChecked = false;
        }
        // Now that all columns are false, Test that isChecked is false
        expect(scope.isChecked()).toBe(false);
    }));

    // Test that the logout function will redirect the user from the search page to
    // the login page
    it('should test the logout function', inject(function($controller, $state) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        // Set cookies to be cleared
        setCookie('at', guestAccessToken);
        setCookie('ats', guestAccessSecret);
        // Start at the search page
        $state.go('search');
        $rootScope.$digest();
        // Test that we are at the search page
        expect($state.is('search')).toBe(true);

        scope.logout();
        $rootScope.$digest();
        // Test that we are now at the login screen
        expect($state.is('login')).toBe(true);
        // Test that the cookies were cleared correctly
        expect(document.cookie).toBe('');
    }));
});

// Test Suite for the LoginController
describe('LoginController', function() {

   var $rootScope, $state, $injector;

    // Load the main app module before each spec
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

        // Begin at the login page
        $state.go('login');
        $rootScope.$digest();
        // set Guest access token/secret cookies
        setCookie('at', guestAccessToken);
        setCookie('ats', guestAccessSecret);
    });
    // Test that the guest_sign_in function brings user to search page
    it('should test the guest_sign_in function', inject(function($controller, $state) {
        var scope = {},
            ctrl = $controller('LoginController', { $scope: scope });

        // Test that we are beginning at the login page
        expect($state.is('login')).toBe(true);
        // Use the Guest sign in
        scope.guest_sign_in();
        $rootScope.$digest();
        // Test that we are now on the search page
        expect($state.is('search')).toBe(true);
    }));
});