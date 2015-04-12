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

     beforeEach(function() {
        var $rootScope, $state, $injector, myServiceMock, state = 'myState';

        module('twitterTool');

        inject(function(_$rootScope_, _$state_, _$injector_, $templateCache) {
          $rootScope = _$rootScope_;
          $state = _$state_;
          $injector = _$injector_;

          // We need add the template entry into the templateCache if we ever
          // specify a templateUrl
          $templateCache.put('partials/login.html', '');
        })
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
});

describe('LoginController', function() {

    // Load the main app module before each spec
    beforeEach(module('twitterTool'));

    it('should test that the default state is the login page')

});
