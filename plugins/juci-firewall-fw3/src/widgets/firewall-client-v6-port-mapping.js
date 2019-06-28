//!Author: Feten Besbes <feten.besbes@pivasoftware.com>

JUCI.app
.directive("firewallClientV6PortMapping", function(){
	return {
		templateUrl: "/widgets/firewall-client-v6-port-mapping.html",
		scope: {
			client: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "firewallClientV6PortMappingCtrl"
	}
})
.controller("firewallClientV6PortMappingCtrl", function($scope, $uci, $firewall, $tr, gettext, $rpc, $juciConfirm){
	$scope.ProtocolTypes = [
		{ label: $tr(gettext("TCP + UDP")), value: "tcpudp" },
		{ label: $tr(gettext("TCP")), value: "tcp" },
		{ label: $tr(gettext("UDP")), value: "udp" }
	];

	var opts = ["dest_port", "name", "proto"];
	$scope.lanZones = [];
	$scope.wanZones = [];
	$scope.edit = null;

	function reload(){
		if(!$scope.client) return;
		$scope.lanZones = [];
		$scope.wanZones = [];
		async.series([
		function(next){
			$firewall.getLanZones().done(function(zones){
				$scope.lanZones = zones;
			}).always(function(){next();});
		},function(next){
			$firewall.getWanZones().done(function(zones){
				$scope.wanZones = zones;
			}).always(function(){next();});
		},function(next){
			$uci.$sync("firewall").done(function(){
				$scope.forwardings = $uci.firewall["@forwarding"];
				$scope.portMaps = $uci.firewall["@rule"].filter(function(pm){
					if(!pm || pm.family.value !== "ipv6")
						return false;

					// check if the destination is a lan zone
					if($scope.lanZones.find(function(zone){
						return zone.name.value === pm.dest.value;
					}) === undefined) return false;

					// check if src is a wan zone
					if($scope.wanZones.find(function(zone){
						return zone.name.value === pm.src.value;
					}) === undefined) return false;

					if(pm.duid.value !== $scope.client.duid)
						return false;
					return true;
				});
			}).always(function(){next();});
		}], function(){
			$scope.$apply();
		});
	}

	reload();

	function get_lan_zone_from_network(network){
		var zone = $scope.lanZones.find(function(zone){
			return zone.network.value.indexOf(network) !== -1;
		});
		if(!zone || !zone.name.value) return null;
		return zone.name.value;
	}

	function get_wan_zone_from_lan_zone(zone){
		if(!$scope.forwardings instanceof Array)
			return null;
		var fw = $scope.forwardings.find(function(forwarding){
			return forwarding.src.value === zone;
		});
		if(!fw || !fw.dest.value)
			return null;

		return fw.dest.value;
	}

	$scope.addPM = function(){
		if(!$scope.client || !$scope.client.network || !$scope.client.duid) {
			console.error("client missing duid or network");
			return;
		}

		var lan_zone = get_lan_zone_from_network($scope.client.network);

		if(!lan_zone) {
			console.error("could not detect client's zone");
			return;
		}

		var wan_zone = get_wan_zone_from_lan_zone(lan_zone);

		if(!wan_zone) {
			console.error("could not detect client's outgoing zone");
			return;
		}

		if(lan_zone === null || wan_zone === null){
			console.error("couldn't figure out correct wan/lan zone");
			return;
		}
		$uci.firewall.$create({
			".type": "rule",
			"type": "generic",
			"src": wan_zone,
			"family": "ipv6",
			"dest": lan_zone,
			"target": "ACCEPT",
			"duid": $scope.client.duid
		}).done(function(pm){
			pm[".new"] = true;
			$scope.edit = pm;
			$scope.$apply();
		});
	};

	var portsOrRange = new ($uci.validators.PortsOrRangeValidator())();

	$scope.getValid = function(port){
		if(!port || !$scope.edit || !$scope.edit[port]) return null;
		var err = null;
		if(port === "dest_port"){
			err = portsOrRange.validate($scope.edit[port]);
		}
		if(err) return String(err);
		return null;
	};

	$scope.onSaveEdit = function(){
		var error = [];
		if($scope.edit.name.value === "")
			error.push($tr(gettext("Port mapping rule needs a name")));
		var src_error = $scope.getValid("dest_port");
		if(src_error !== null){
			error.push($tr(gettext("Fixe Errors before saving")));
		}
		if($scope.edit.dest_port.value === "")
			error.push($tr(gettext("Rule can not have empty Public port")));
		if(error.length > 0){
			$scope.error = error;
			return;
		}

		if($scope.edit[".new"]){
			$scope.edit[".new"] = undefined;
		}
		$scope.edit = null;
		reload();
	}

	$scope.onAbortEdit = function(){
		if($scope.edit[".new"]){
			$scope.edit.$delete().done(function(){
				$scope.edit = null;
				reload();
				return;
			});
		}
		resetToOld($scope.edit);
		$scope.edit = null;
		reload();
	};
	function resetToOld(pm){
		if(!pm) return;
		opts.map(function(opt){
			if(!pm[opt] || !pm[".old_"+opt]) return;
			pm[opt].value = pm[".old_"+opt];
		});
	}
	$scope.onEditPM = function(pm){
		$scope.edit = pm;
		opts.map(function(opt){
			$scope.edit[".old_"+opt] = pm[opt].value;
		});
	}
	$scope.onDeletePM = function(pm){
		$juciConfirm.show("Are you sure you want to delete " + pm.name.value).done(function(){
			pm.$delete().done(function(){
				reload();
			});
		});
	};
});
