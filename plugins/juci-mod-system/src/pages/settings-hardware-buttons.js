//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("ManagementButtonsCtrl", function($scope, $uci){
	$uci.$sync("buttons").done(function(){
		$scope.buttons = $uci.buttons["@button"];
		$scope.$apply();
	});
});
