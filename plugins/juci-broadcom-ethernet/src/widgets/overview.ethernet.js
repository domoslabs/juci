JUCI.app
.directive("overviewStatusWidget01Ethernet", function(){
	return {
		templateUrl: "/widgets/overview.ethernet.small.html",
		controller: "overviewWidgetEthernet",
		replace: true
	};
})
.controller("overviewWidgetEthernet", function($scope, $ethernet){
	$scope.ethPorts = [];
	JUCI.interval.repeat("overview-status-widget-ethernet", 5000, function(done){
		$ethernet.getAdapters().done(function(adapters){
			$scope.ethPorts = adapters.filter(function(a){ return a.type == "eth-port"; }).sort(function(a, b){
				if(a.name === "WAN") return 1;
				if(b.name === "WAN") return -1;
				return parseInt(a.name.slice(-1)) - parseInt(b.name.slice(-1));
			});
			$scope.$apply();
		}).always(function(){done();});
	});
	$scope.getState = function(port){
		if(port.carrier) return "success";
		return "default";
	};
	$scope.getName = function(port){
		if(port.name == "WAN") return "W";
		return "L"+port.name.slice(-1);
	};
});
