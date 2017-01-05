JUCI.app
.controller("wirelessBandSteering", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(data){
		$scope.wireless = $uci.wireless;
		$scope.$apply();
	});
	
}); 
