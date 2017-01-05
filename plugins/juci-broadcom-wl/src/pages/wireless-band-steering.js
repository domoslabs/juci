JUCI.app
.controller("wirelessBandSteering", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(data){
		$scope.wireless = $uci.wireless;
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
