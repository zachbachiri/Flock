describe('MainController', function(){

    beforeEach(module('twitterTool'));

    it('should create an example query', inject(function($controller) {
        var scope = {},
            ctrl = $controller('MainController', {$scope:scope});
        expect(scope.show_loading).toBe(false);
        expect(scope.show_visualize).toBe(false);
        expect(scope.show_advanced_search).toBe(false);
        expect(scope.visualize_copy).toBe("Visualize");
    }));

})