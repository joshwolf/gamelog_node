angular-ua-parser
===

You can download angular-ua-parser by:

* (prefered) Using bower and running `bower install angular-ua-parser --save`
* Using npm and running `npm install angular-ua-parser --save`
* Downloading it manually by clicking [here to download development unminified version](https://raw.github.com/gdi2290/angular-ua-parser/master/angular-ua-parser.js)


````html
<script src="https://raw.github.com/faisalman/ua-parser-js/master/src/ua-parser.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.js"></script>
<script src="app/bower_components/angular-ua-parser/angular-ua-parser.js"></script>

<script>
  angular.module('YOUR_APP', [
    'ngUAParser',
    'controllers'
  ]);

  angular.module('controllers', [])
    .controller('MainCtrl', function($scope, UAParser) {
      $scope.getUA = function() {
        UAParser.getUA();
      };
    });
</script>
````
