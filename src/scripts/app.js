app = angular.module('app', ['prettySlider']);

app.controller('ItemCtrl', ['$scope', function($scope){
	$scope.item = {cost: 0};
}]);
