/*
    @author:  Zach Bachiri
    @created: Jan 26, 2015
    @group:   #11
    @purpose: Initiate Angular Modules and Controller
*/
var app = angular.module('twitterTool', ['ui.router', 'appControllers']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
    // LOGIN STATE
        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'LoginController'
        })
    // REDIRECT STATE
        .state('redirect', {
            url: '/redirect',
            templateUrl: 'partials/redirect.html',
            controller: 'RedirectController'
        })
    // SEARCH STATE
        .state('search', {
            url: '/search',
            templateUrl: 'partials/search.html',
            controller: 'MainController'
        });


});
