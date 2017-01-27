JUCI.app
.controller("wirelessBandSteeringStatus", function($scope, $uci, $wireless, gettext, $rpc, $tr, gettext){
	$scope.data = {};
	function update(){
		$rpc.$call("juci.wireless", "bsd_status").done(function(data){
			$scope.data.bsd_status = data.bsd_status;
			$scope.$apply();
		})
		$rpc.$call("juci.wireless", "bsd_log").done(function(data){
			$scope.data.bsd_log = data.bsd_log;
			$scope.$apply();
		})
	}
	JUCI.interval.repeat("update",10000,function(next){
		update();
		next();
	});
}); 
