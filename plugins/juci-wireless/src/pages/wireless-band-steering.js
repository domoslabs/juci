JUCI.app
.controller("wirelessBandSteering", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(data){
		$scope.bandsteering = $uci.wireless['@bandsteering'][0];
		$scope.enabled = $scope.bandsteering.enabled.value;
		$scope.policys = [{label:'RSSI',value:0},{label:'Bandwidth Usage',value:1}];
		$scope.$apply();
	});
	$rpc.$call("router.wireless", "radios").done(function(data){
		$scope.wlRadios = data;
		$scope.isDualBand = function(){
			if($scope.wlRadios){
				if(Object.keys($scope.wlRadios).length > 1){
					return true;
					}
			}
			return false;
		}

		$scope.isntDualBand = function(){ return !$scope.isDualBand(); };
		$scope.$apply();
	});
}); 
