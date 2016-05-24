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

	var lanZones = [];
	var wanZones = [];
	$scope.data = {
		src_dport: "",
		dest_port: ""
	}

	$scope.$watch("client", function(){
		$rpc.$call("juci.firewall", "run", {"method":"excluded_ports"}).done(function(res){
			$scope.excluded_ports = res.result || "";
			reload();
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
						return zone.name.value == pm.dest.value;
					}) == undefined) return false;
					if(wanZones.find(function(zone){
						return zone.name.value == pm.src.value;
					}) == undefined) return false;
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
			$scope.data.dest_port = $scope.data.src_dport = "";
			$scope.mapping = pm;
			$scope.$apply();
		});
	};
	var portValidator = new $uci.validators.PortValidator();
	$scope.getValid = function(port){
		if(!port || !$scope.data || !$scope.data[port]) return null;
		var error = portValidator.validate({value:$scope.data[port]});
		if(error) return String(error);
		if(isExcluded($scope.data.src_dport))
			return $tr(gettext("Rule may not have any excluded Public ports"));
		return null;
	};

	function isExcluded(port){
		if(portValidator.validate({value:port}) != null) return false;
		if(port == "") return false;
		var ex = $scope.excluded_ports.split(" ").map(function(x){ return parseInt(x); }).sort();
		var ok = false;
		if(port.match(/-/)){
			var start = parseInt(port.split("-")[0]);
			var stop = parseInt(port.split("-")[1]);
			ex.map(function(e){
				if(e == start || e == stop || (e > start && e < stop)) ok = true;
			});
			return ok;
		}
		ok = false;
		ex.map(function(e){ if(e == parseInt(port)) ok = true; });
		return ok;
	}

	$scope.onSaveEdit = function(){
		var error = [];
		if($scope.mapping.name.value == "")
			error.push($tr(gettext("Port mapping rule needs a name")));
		var dest_error = portValidator.validate({value:$scope.data.dest_port})
		var src_errors = portValidator.validate({value:$scope.data.src_dport})
		if(dest_error)
			error.push($tr(gettext("Rule has invalid Private port")));
		if(src_errors)
			error.push($tr(gettext("Rule has invalid Public port")));
		if($scope.data.src_dport == "")
			error.push($tr(gettext("Rule can not have empty Private port")));
		if(isExcluded($scope.data.src_dport))
			error.push($tr(gettext("Rule may not have any excluded Public ports")));
		if(error.length > 0){
			$scope.error = error;
			return;
		}
		if($scope.mapping[".new"]){
			$scope.mapping[".new"] = undefined;
		}
		$scope.mapping.dest_port.value = $scope.data.dest_port+"";
		$scope.mapping.src_dport.value = $scope.data.src_dport+"";
		$scope.mapping = null;
		reload();
	}
	$scope.onAbortEdit = function(){
		if($scope.mapping[".new"]){
			$scope.mapping.$delete().done(function(){
				$scope.mapping = null;
				reload();
				return;
			});
		}
		$scope.mapping.$reset();
		$scope.mapping = null;
		reload();
	};
	$scope.onEditPM = function(pm){
		$scope.mapping = pm;
		$scope.data.dest_port = pm.dest_port.value;
		$scope.data.src_dport = pm.src_dport.value;
	}
	$scope.onDeletePM = function(pm){
		if(confirm("Are you sure you want to delete " + pm.name.value)){
			pm.$delete().done(function(){
				reload();
			});
		}
	};
});
