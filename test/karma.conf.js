module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
      'http://maps.google.com/maps/api/js?sensor=false&libraries=places',
      'plugins/masonry.pkgd.min.js',
      'plugins/imagesloaded.pkgd.min.js',
      'plugins/codebird.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.13/angular-mocks.js',
      'plugins/angular-masonry-directive.js',
      'app.js',
      'test/unit/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};