
JUCI.app
.controller("StatusDomos", function($scope, $rpc, $uci, $tr, gettext, $events, $timeout){
	$uci.$sync(["domosdq"]).done(function(){
		$scope.probe = $uci.domosdq.probe;
		$scope.daemon = $uci.domosdq.daemon;
		$scope.$apply();
	});
});


