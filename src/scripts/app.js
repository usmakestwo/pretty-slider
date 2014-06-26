app = angular.module('app', ['ui-slider']);

app.controller('ItemCtrl', ['$scope', function($scope){
	$scope.item = {cost: 0};
}]);
