/*
author: Jimmy Ly
date: February 23, 2015
group: P11 - Flock
purpose: Provide Jasmine unit tests for the MainController. The functionality
         being tested includes the search, the results display, and the download
         to .csv feature.
*/

// Test suite for the MainController
describe('MainController', function() {

    // Load the main app module before each spec
    beforeEach(module('twitterTool'));

    // Test the state of the application before making a query
    it('should test initialization of variables', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });
        expect(scope.tweets).toEqual([]);
        expect(scope.show_loading).toBe(false);
        expect(scope.show_visualize).toBe(false);
        expect(scope.show_advanced_search).toBe(false);
        expect(scope.visualize_copy).toBe("Visualize");

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
    }));

    // Test the state of the application when making a query
    it('should test variables when making queries', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', { $scope: scope });

        form_parameters = {
            q: "oscars",
            loc: "",
            result_type: "popular"
        };
        scope.query(form_parameters);
        expect(scope.show_loading).toBe(true);
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
})

// Test suite for directives
describe('Directives', function() {
    var $compile,
        $rootScope;

    // Load the main app before each spec
    beforeEach(module('twitterTool'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should test that a masonry brick contains tweet data', function() {

        // example tweet data used from Twitter API response
        var sample_tweet1 = {
                               "text":"Test Tweet 1",
                               "user":{
                                   "name":"Test User1",
                                   "screen_name":"TestUser1",
                                   "profile_image_url_https":"https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png",
                               }
                           }

        $rootScope.tweet = sample_tweet1;

        // sample_tweet1 user picture
        var element = $compile('<img ng-src="{{ tweet.user.profile_image_url_https }}" class="profile_image">')($rootScope);
        $rootScope.$digest();
        expect(element.attr('src')).toBe("https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png");

        // sample_tweet1 user name
        element = $compile('<span class="profile_name">{{ tweet.user.name }}</span>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("Test User1");

        // sample_tweet1 user screen name
        element = $compile('<span class="profile_screen_name">@{{ tweet.user.screen_name }}</span>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("@TestUser1");

        // sample_tweet1 user tweet
        element = $compile('<p class="profile_tweet">{{ tweet.text }}</p>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("Test Tweet 1");
    })
})