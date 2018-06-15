JUCI.app
.controller("wirelessBandSteeringStatus", function($scope, $uci, $wireless, gettext, $rpc, $tr, gettext){
	$scope.data = {};
	$wireless.getInterfaces().done(function(ifaces){
		function update(){
			$rpc.$call("wifi.bsd", "sta_info").done(function(data){
				if(!data || !data.stations || !data.stations instanceof Array)
					return;
				$scope.data.bsd_status = data.stations.map(function(sta){
					sta.sta_mac = String(sta.sta_mac).toUpperCase();
					var iface = ifaces.find(function(i){
						return i && i.$info && i.$info.wldev && i.$info.wldev === sta.interface;
					});
					if(iface && iface[".frequency"])
						sta.freq = iface[".frequency"];
					return sta;
				});
				$scope.$apply();
			}).fail(function(e){
				console.log(e);
			});
			$rpc.$call("wifi.bsd", "records").done(function(data){
				if(!data || !data.logs || !data.logs instanceof Array)
					return;
				$scope.data.bsd_logs = data.logs.map(function(log){
					log.sta_mac = String(log.sta_mac).toUpperCase();
					return log;
				});
				$scope.$apply();
			}).fail(function(e){
				console.log(e);
			});
		}
		JUCI.interval.repeat("update",10000,function(next){
			update();
			next();
		});
	});
})
.filter('capitalize', function() {
	return function(input) {
		input = String(input);
		return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
	}
});
