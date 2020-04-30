
JUCI.app
.controller("StatusDomosOld", function($scope, $rpc, $uci, $tr, gettext, $events, $timeout){
	$uci.$sync(["domos"]).done(function(){
		$scope.config = $uci.domos.config;
		$scope.$apply();
	});
});


