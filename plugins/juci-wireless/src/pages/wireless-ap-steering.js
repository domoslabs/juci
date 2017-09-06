JUCI.app
.controller("wirelessAPSteering", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(data){
		if($uci.wireless['@apsteering'].length === 0){
			$uci.wireless.$create({
				".name": "apsteering",
				".type": "apsteering"
			}).done(function(section){
				$scope.apsteering = section;
				$scope.$apply();
			}).fail(function(e){
				console.error("uci create apsteering section failed", e);
			});
		} else {
			$scope.apsteering = $uci.wireless['@apsteering'][0];
			$scope.enabled = $scope.apsteering.enabled.value;
			$scope.$apply();
		}
	});
});
