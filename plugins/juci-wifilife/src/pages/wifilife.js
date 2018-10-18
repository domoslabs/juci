/*JUCI.app
.controller("wifilife", function($scope, $uci, $wifilife){
	console.log("3 hlelo");
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
});*/
JUCI.app.controller("wifilife", function ($scope, $rpc, $uci) {
	/*$rpc.juci.system.info().done(function (info) {
		$scope.text = JSON.stringify(info);
		$scope.$apply();
	});*/
	console.log("27");
});
