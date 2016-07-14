//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("owsdPageCtrl", function($scope, $uci){
	$uci.$sync("owsd").done(function(){
		$scope.allListen = $uci["@owsd-listen"];
		$scope.$apply();
	}).fail(function(e){console.log(e);});
});
