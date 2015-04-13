/*
    @author:  Jimmy Ly
    @created: March 3, 2015
    @group:   #11
    @purpose: Provide Jasmine unit tests for the directives in index.js.
*/

// Test suite for directives
describe('Directives', function(){
    var $compile,
        $rootScope,
        element;

    // Load the main app before each spec
    beforeEach(module('twitterTool'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    // make sure that the display blocks contain the appropriate Twitter data
    it('should test that a masonry brick contains correct tweet data', function(){

        // example tweet data used from Twitter API response
        var sample_tweet = {
                               "text":"Test Tweet 1",
                               "user":{
                                   "name":"Test User1",
                                   "screen_name":"TestUser1",
                                   "profile_image_url_https":"https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png",
                               }
                           };

        $rootScope.tweet = sample_tweet;

        // Test that the correct profile image is displayed based on the sample tweet
        element = $compile('<img ng-src="{{ tweet.user.profile_image_url_https }}" class="profile_image">')($rootScope);
        $rootScope.$digest();
        expect(element.attr('src')).toBe("https:\/\/abs.twimg.com\/sticky\/default_profile_images\/default_profile_6_normal.png");

        // Test that the correct username is displayed based on the sample tweet
        element = $compile('<span class="profile_name">{{ tweet.user.name }}</span>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("Test User1");

        // Test that the correct screen name is displayed based on the sample tweet
        element = $compile('<span class="profile_screen_name">@{{ tweet.user.screen_name }}</span>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("@TestUser1");

        // Test that the correct tweet message contents are displayed based on the sample tweet
        element = $compile('<p class="profile_tweet">{{ tweet.text }}</p>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toBe("Test Tweet 1");

        // Test that if the tweet does not contain an image, then an image div is not created for the Masonry brick
        var media_template = '<div>' +
                                '<span ng-if="tweet.entities.media">' +
                                    '<img class="profile_media" style="max-width:100%;" ng-src="{{ tweet.entities.media[0].media_url }}">' +
                                '</span>' +
                            '</div>'
        element = $compile(media_template)($rootScope);
        $rootScope.$digest();
        var img = element.find('img');
        expect(img.length).toBe(0);

        // Test that if the tweet does contain an image, then an image div with the correct src url is in the Masonry brick
        $rootScope.tweet.entities = {}
        $rootScope.tweet.entities.media = [{ "media_url":"http:\/\/pbs.twimg.com\/media\/B_HMH5CXIAEwPtM.jpg" }];
        element = $compile(media_template)($rootScope);
        $rootScope.$digest();
        img = element.find('img');
        expect(img.length).toBe(1);
        expect(element.html()).toContain("http:\/\/pbs.twimg.com\/media\/B_HMH5CXIAEwPtM.jpg");

        // Test that if a tweet is not a retweet, then then the brick will not have a
        // 'retweeted status' retweet count or favorite count
        $rootScope.tweet.retweet_count = 3;
        $rootScope.tweet.favorite_count = 5;
        $rootScope.tweet.retweeted_status = null;

        var retweet_template = '<div>' +
                                  '<span ng-if="tweet.retweeted_status">' +
                                      '<span class="retweet_count">{{ tweet.retweeted_status.retweet_count }}</span>' +
                                      '<span class="favorite_count">{{ tweet.retweeted_status.favorite_count }}</span>' +
                                  '</span>' +
                              '<div>';
        element = $compile(retweet_template)($rootScope);
        $rootScope.$digest();

        var retweet_count = element.find('.retweet_count');
        expect(retweet_count.length).toBe(0);

        var favorite_count = element.find('.favorite_count');
        expect(favorite_count.length).toBe(0);

        // Test that if a tweet is not a retweet, then the brick will have a normal
        // retweet count and favorite count
        var no_retweet_template = '<div>' +
                                      '<span ng-if="tweet.retweeted_status == null">' +
                                          '<span class="retweet_count">{{ tweet.retweet_count }}</span>' +
                                          '<span class="favorite_count">{{ tweet.favorite_count }}</span>' +
                                      '</span>' +
                                  '</div>';
        element = $compile(no_retweet_template)($rootScope);
        $rootScope.$digest();
        retweet_count = element.find('.retweet_count');
        expect(retweet_count.length).toBe(1);
        expect(retweet_count.html()).toBe('3');

        favorite_count = element.find('.favorite_count');
        expect(favorite_count.length).toBe(1);
        expect(favorite_count.html()).toBe('5');

        // Test that if a tweet is a retweet, then the brick will have an appropriate retweet count and favorite count
        $rootScope.tweet.retweeted_status = {
                                                retweet_count: 7,
                                                favorite_count: 20
                                            };
        element = $compile(retweet_template)($rootScope);
        $rootScope.$digest();

        retweet_count = element.find('.retweet_count');
        expect(retweet_count.length).toBe(1);
        expect(retweet_count.html()).toBe('7');

        favorite_count = element.find('.favorite_count');
        expect(favorite_count.length).toBe(1);
        expect(favorite_count.html()).toBe('20');
    });

    // Test the View More Tweets button
    it('should test the "View More Tweets" view', function(){
        // Simulate initial state of variables
        $rootScope.show_loading = false;
        $rootScope.show_visualize = false;
        $rootScope.have_searched = false;
        $rootScope.load_more_copy = "View More Tweets";

        var view_more_template = '<button id="load_more" ng-hide="show_loading || show_visualize || !have_searched" ng-click="load_more()">{{ load_more_copy }}</button>';
        element = $compile(view_more_template)($rootScope);
        $rootScope.$digest();

        // Test that the View More Tweets button is initially hidden
        expect(element.hasClass('ng-hide')).toBe(true);
        expect(element.html()).toBe('View More Tweets');

        // simulate user making query
        $rootScope.show_loading = true;
        element = $compile(view_more_template)($rootScope);
        $rootScope.$digest();

        // Test that the View More Tweets button is still hidden
        expect(element.hasClass('ng-hide')).toBe(true);
        expect(element.html()).toBe('View More Tweets');

        // Simulate tweet results returning
        $rootScope.show_loading = false;
        $rootScope.have_searched = true;
        element = $compile(view_more_template)($rootScope);
        $rootScope.$digest();

        // Test that the View More Tweets button is no longer hidden
        expect(element.hasClass('ng-hide')).toBe(false);
        expect(element.html()).toBe('View More Tweets');

        // Simulate tweet user clicking View More Tweets button
        $rootScope.load_more_copy = "...";
        element = $compile(view_more_template)($rootScope);
        $rootScope.$digest();

        // Test that the View More Tweets button now displays "..."
        expect(element.hasClass('ng-hide')).toBe(false);
        expect(element.html()).toBe('...');
    });

    // Test the Visualize button
    it('should test the visualize view behavior', function(){
        $rootScope.show_visualize = false;
        var visualize_template = '<div class="container" ng-show="show_visualize">' +
                                    '<h1>Visualize</h1>' +
                                '</div>';

        // Test that the visualize page is initially hidden
        element = $compile(visualize_template)($rootScope);
        $rootScope.$digest();
        expect(element.hasClass('ng-hide')).toBe(true);

        // Test that the visualize page is displayed after clicking Visualize
        $rootScope.show_visualize = true;
        element = $compile(visualize_template)($rootScope);
        $rootScope.$digest();
        expect(element.hasClass('ng-hide')).toBe(false);
    });

    // Test the Loading Spinner
    it('should test the loading_gif behavior', function(){
        $rootScope.show_loading = false;
        var loading_template = '<div class="container" ng-show="show_loading">' +
                                   '<img class="loading_gif" src="/styles/images/ajax-loader.gif">' +
                               '</div>';

        // Test that the Loading Spinner is initially hidden
        element = $compile(loading_template)($rootScope);
        $rootScope.$digest();
        expect(element.hasClass('ng-hide')).toBe(true);

        // Test that the Loading Spinner is shown when show_loading is true, i.e. when making a search
        $rootScope.show_loading = true;
        element = $compile(loading_template)($rootScope);
        $rootScope.$digest();
        expect(element.hasClass('ng-hide')).toBe(false);
    });
})