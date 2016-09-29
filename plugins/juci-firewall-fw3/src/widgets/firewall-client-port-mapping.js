//!Author: Reidar Cederqvist <reidar.cederqvist@gmai.com>

JUCI.app
.directive("firewallClientPortMapping", function(){
	return {
		templateUrl: "/widgets/firewall-client-port-mapping.html",
		scope: {
			client: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "firewallClientPortMappingCtrl"
	}
})
.controller("firewallClientPortMappingCtrl", function($scope, $uci, $firewall, $tr, gettext, $rpc){
	$scope.ProtocolTypes = [
		{ label: $tr(gettext("TCP + UDP")), value: "tcp udp" },
		{ label: $tr(gettext("TCP")), value: "tcp" },
		{ label: $tr(gettext("UDP")), value: "udp" },
		{ label: $tr(gettext("All")), value: "all" }
	];

	var opts = ["src_dport", "dest_port", "name", "proto"];
	var lanZones = [];
	var wanZones = [];
	$scope.edit = null;

	$scope.$watch("client", function(){
		$rpc.$call("juci.firewall", "run", {"method":"excluded_ports"}).done(function(res){
			$scope.excluded_ports = res.result || "";
			reload();
		}).fail(function(e){
			console.log(e);
		});
	}, false);
	function reload(){
		if(!$scope.client) return;
		lanZones = [];
		wanZones = [];
		async.series([
		function(next){
			$firewall.getLanZones().done(function(zones){
				lanZones = zones;
			}).always(function(){next();});
		},function(next){
			$firewall.getWanZones().done(function(zones){
				wanZones = zones;
			}).always(function(){next();});
		},function(next){
			$uci.$sync("firewall").done(function(){
				$scope.portMaps = $uci.firewall["@redirect"].filter(function(pm){
					if(!pm || !pm.enabled.value || pm.target.value != "DNAT" || pm.reflection.value) return false;
					if(lanZones.find(function(zone){
						return zone.name.value === pm.dest.value;
					}) === undefined) return false;
					if(wanZones.find(function(zone){
						return zone.name.value === pm.src.value;
					}) === undefined) return false;
					if(pm.dest_ip.value != $scope.client.ipaddr) return false;
					return true;
				});
			}).always(function(){next();});
		}], function(){
			$scope.$apply();
		});
	}
	$scope.addPM = function(){
		$uci.firewall.$create({
			".type": "redirect",
			"enabled": true,
			"target": "DNAT",
			"reflection": false,
			"dest": lanZones[0].name.value || "lan",
			"src": wanZones[0].name.value || "wan",
			"dest_ip": $scope.client.ipaddr,
			".new": true
		}).done(function(pm){
			pm[".new"] = true;
			$scope.edit = pm;
			$scope.$apply();
		});
	};
	var portValidator = new $uci.validators.PortValidator();
	var portOrRange = new ($uci.validators.PortOrRangeValidator())();

	$scope.getValid = function(port){
		if(!port || !$scope.edit || !$scope.edit[port]) return null;
		var err = null;
		if(port === "src_dport"){
			if(isExcluded($scope.edit[port].value)){
				return $tr(gettext("Rule may not have any excluded Public ports"));
			}
			err = portOrRange.validate($scope.edit[port]);
		}
		if(port === "dest_port"){
			err = portValidator.validate($scope.edit[port]);
		}
		if(err) return String(err);
		return null;
	};
	function isExcluded(port){
		if(port === "") return false;
		var ex = $scope.excluded_ports.split(" ").map(function(x){ return parseInt(x); }).sort();
		var ok = false;
		if(port.match(/:/)){
			var start = parseInt(port.split(":")[0]);
			var stop = parseInt(port.split(":")[1]);
			ex.map(function(e){
				if(e === start || e === stop || (e > start && e < stop)) ok = true;
			});
			return ok;
		}
		ok = false;
		ex.map(function(e){ if(e === parseInt(port)) ok = true; });
		return ok;
	}

	$scope.onSaveEdit = function(){
		var error = [];
		if($scope.edit.name.value === "")
			error.push($tr(gettext("Port mapping rule needs a name")));
		var dest_error = $scope.getValid("dest_port");
		var src_error = $scope.getValid("src_dport");
		if(src_error !== null || dest_error !== null){
			error.push($tr(gettext("Fixe Errors before saving")));
		}
		if($scope.edit.src_dport.value === "")
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
		if(confirm("Are you sure you want to delete " + pm.name.value)){
			pm.$delete().done(function(){
				reload();
			});
		}
	};
});
