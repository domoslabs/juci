
JUCI.app
.controller("ManagementLedsCtrl", function($scope, $uci){
	$uci.$sync("leds").done(function(){
		$scope.leds = $uci.leds["@led"];
		$scope.$apply();
	});
});

