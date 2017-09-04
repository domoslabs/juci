JUCI.app
.controller("wirelessAPSteering", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(data){
		$scope.apsteering = $uci.wireless['@apsteering'][0];
		$scope.enabled = $scope.apsteering.enabled.value;
		$scope.$apply();
	});
});
