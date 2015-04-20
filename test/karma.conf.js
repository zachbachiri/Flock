module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
      'http://maps.google.com/maps/api/js?sensor=false&libraries=places',
      'plugins/masonry.pkgd.min.js',
      'plugins/imagesloaded.pkgd.min.js',
      'plugins/codebird.js',
      'plugins/jquery.min.js',
      'plugins/jquery-ui.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.13/angular-mocks.js',
      'plugins/angular-ui.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.8/angular-ui-router.min.js',
      'plugins/ngDialog.min.js',
      'plugins/underscore.min.js',
      'plugins/d3.js',
      'plugins/d3.layout.cloud.js',
      'plugins/angular-masonry-directive.js',
      'app.js',
      'infoMap.js',
      'controllers.js',
      'partials/*',
      'utils/*',
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
