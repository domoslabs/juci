JUCI.app
.directive("overviewStatusWidget01Ethernet", function(){
	return {
		templateUrl: "/widgets/overview.ethernet.small.html",
		controller: "overviewWidgetEthernet",
		replace: true
	};
})
.controller("overviewWidgetEthernet", function($scope, $network, $events, $config){
	$scope.href = $config.getWidgetLink("overviewStatusWidget01Ethernet");
	$scope.ethPorts = [];
	JUCI.interval.repeat("update-ethernet-overview-widget", 10000, function(done){refresh(); done();});
	function refresh(){
		$network.getAdapters().done(function(adapters){
			var ports  = adapters.filter(function(a){ return a.type == "eth-port"; }).sort(function(a, b){
				if(a.name === "WAN") return 1;
				if(b.name === "WAN") return -1;
				return parseInt(a.name.slice(-1)) - parseInt(b.name.slice(-1));
			});
			async.eachSeries(ports, function(port, next){
				if(!port.device){
					port.up = false;
					next();
					return;
				}
				$rpc.$call("router.port", "status", { "port":port.device }).done(function(ret){
					if(!ret || !ret.up)
						port.is_up = false;
					else
						port.is_up = true;
				}).fail(function(err){
					console.log(err);
					port.is_up = false;
				}).always(function(){next();});
			}, function(err){
				if(err)
					console.log(err);
				$scope.ethPorts = ports;
				$scope.$apply();
			});
		});
	}
	$events.subscribe("hotplug.switch", function(){refresh();});
	$scope.getState = function(port){
		if(port.is_up) return "success";
		return "default";
	};
	$scope.getName = function(port){
		if(port.name == "WAN") return "W";
		return "L"+port.name.slice(-1);
	};
});
