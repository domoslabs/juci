
JUCI.app
.controller("StatusDomosQos", function($scope, $rpc, $uci, $tr, gettext, $events, $timeout){
	$uci.$sync(["domosqos"]).done(function(){
		$scope.runtime = $uci.domosqos.runtime;
		$scope.$apply();
	});
});
