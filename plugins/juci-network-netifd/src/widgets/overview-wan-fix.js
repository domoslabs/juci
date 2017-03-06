//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("overviewWanFix", function(){
	return {
		templateUrl: "widgets/overview-wan-fix.html",
		controller: "overivewWanFixCtrl",
		scope: {
			model:"=ngModel"
		},
		replace: true
	}
}).controller("overivewWanFixCtrl", function($scope, $tr, gettext, $juciDialog, $firewall, $events){
	$scope.$on("$destroy", function(){
		JUCI.interval.clear("overview-wan-fix-check-internet");
	});
	JUCI.interval.repeat("overvew-wan-fix-check-internet", 2000, function(done){
		refresh().always(function(){
			done();
		});
	});
	function refresh(){
		var def = $.Deferred();
		async.series([
		function(next){
			$rpc.$call("juci.network", "online").done(function(res){
				$scope.internet = res && res.online;
			}).always(function(){next();});
		}, function(next){
			$firewall.getZoneNetworks("wan").done(function(nets){
				$scope.model.wans = nets.filter(function(net){
					return net.$info && net.defaultroute && net.defaultroute.value;
				});
			}).always(function(){next();});
		} ], function(){
			$scope.link = false;
			async.eachSeries($scope.model.wans, function(wan, next){
				$rpc.$call("juci.network", "has_link", {"interface":wan[".name"]}).done(function(data){
					if(data && data.has_link)
						$scope.link = true;
				}).fail(function(e){
					console.log(e);
				}).always(function(){
					next();
				});
			}, function(){
				$scope.$apply();
				def.resolve();
			});
		});
		return def.promise();
	}
	$scope.reloadNetwork = function(){
		if(!$scope.model.wans || !$scope.model.wans.length)
			return;
		$scope.model.wans.map(function(wan){
			if(!wan.interface)
				return;
			$rpc.$call("juci.network", "ifup", {interface:wan.interface}).fail(function(e){console.log(e);});
		});
	}

	$scope.restartRouter = function(){
		$juciDialog.show(null, {
			title: $tr(gettext("Reboot")),
			content: $tr(gettext("Are you sure you want to reboot?")),
			on_button: function(btn, inst){
				if(btn.value == "yes"){
					$rpc.$call("juci.system", "reboot", {}).done(function(){
						inst.close();
					});
					setTimeout(function(){window.location = "/reboot.html";}, 1000);
				}
				inst.close();
			},
			buttons: [
				{ label: $tr(gettext("Yes")), value: "yes", primary: true },
				{ label: $tr(gettext("No")), value: "no" }
			]
		});
	}
	$events.subscribe("network.interface", function(res){
		refresh();
	});
	$events.subscribe("hotplug.switch", function(res){
		refresh();
	});
});
