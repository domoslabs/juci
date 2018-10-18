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
JUCI.app.
/*directive('enableWifilife', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: "/widgets/enable-wifilife.html",
		controller: "enableWifilife"
	};
}).*/
controller("wifilife", function ($scope, $rpc, $uci, $wifilife) {


	/*$rpc.juci.system.info().done(function (info) {
		$scope.text = JSON.stringify(info);
		$scope.$apply();
	});*/
	$wifilife.getLifeStatus().done(function (status) {
//		obj.enabled = status;
		console.log(status);
	})
	$wifilife.getSteerParams().done(function (params) {
		console.log(params);
	})

	$scope.activateWifilife = function () {
		$uci.$sync("wifilife").done(function () {
			//$uci.wifilife["@wifilife"].enabled = $scope.obj.enabled;
			console.log("481");
		});

	}

	$uci.$sync("wifilife").done(function () {
		$scope.wifilife = $uci.wifilife["@wifilife"][0];
		//$scope.$wifilife
		console.log("481");
	});

	console.log("27");
});
