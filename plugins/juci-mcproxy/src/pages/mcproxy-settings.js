JUCI.app
.controller("McproxyPageCtrl", function($scope, $uci, $tr, gettext, $juciDialog, $network){
	$uci.$sync("mcproxy").done(function(){
		$scope.mcproxy = $uci.mcproxy['mcproxy'];
		$scope.allInstances = $uci.mcproxy["@instance"] || [];

		// Create uci segments if not present
		if ($uci.mcproxy.blocked == undefined) {
			$uci.mcproxy.$create({
				".type":"table",
				".name":"blocked",
				"name":"blocked"
			}).done(function(){
				$uci.$save();
			});
		}
		if ($uci.mcproxy.blockrule == undefined && $scope.allInstances.length) {
			$uci.mcproxy.$create ({
				".type":"behaviour",
				".name":"blockrule",
				"whitelist": false,
				"table": "blocked",
				"section": "upstream",
				"interface":$scope.allInstances[0].upstream.value,
				"instance":$scope.allInstances[0].name.value,
			}).done(function() {
				$uci.$save();
			});
		}
		$scope.blockTable = $uci.mcproxy['blocked'] || {};
		$scope.blockBehaviour = $uci.mcproxy['blockrule'] || {};

		if(Object.keys($scope.blockTable).length > 0) {
			$scope.exception = $scope.blockTable.entries.value.map(function(e){
				return e.replace('(*|', '').replace(')','');
			});
		}

		$scope.protocol = [
			{label:'IGMPv1(IPv4)',value:'IGMPv1'},
			{label:'IGMPv2(IPv4)',value:'IGMPv2'},
			{label:'IGMPv3(IPv4)',value:'IGMPv3'},
			{label:'MLDv1(IPv6)', value:'MLDv1'},
			{label:'MLDv2(IPv6)',value:'MLDv2'}];

		$scope.allInstances.map(function(instance){
			instance.$statusList = [
				{ label: $tr(gettext("Enable")), value: !(instance.disabled.value) },
				{ label: $tr(gettext("Name")), value: instance.name.value },
				{ label: $tr(gettext("Uplink")), value: instance.upstream.value },
				{ label: $tr(gettext("Downlink")), value: instance.downstream.value },];
		});

		$scope.$apply();
	}).fail(function(e){console.log(e);});

	$scope.getmcInstanceTitle = function(item){
		var na = $tr(gettext("N/A"));
		return String((item.name.value ||  na));
	}

	$scope.onAddInstance = function(){
		var model = {};
		$uci.mcproxy.$create({
			".type":"instance",
		}).done(function(instance){
			$scope.$apply();
		});
	}

	$scope.onDeleteInstance = function(item){
		if(!item || !item.$delete) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	}

	var mcast = new $uci.validators.IP4MulticastAddressValidator;
	var ipv6 = new $uci.validators.IP6AddressValidator;
	var ip6range = new $uci.validators.IP6CIDRValidator;

	$scope.testMcastIp = function($tag){
		// Validation of tag
		if (Object.keys($scope.blockTable).length == 0) {
			$scope.McastIpErr = $tr(gettext("Save uncommited changes before adding new rule"));
				return false;
		}
		var er = [mcast.validate({value:$tag.text}),
				ipv6.validate({value:$tag.text}),
				ip6range.validate({value:$tag.text})].filter(function(x){ return x !== null; });

		if(er.length === 3){
			$scope.McastIpErr = $tr(gettext("Invalid multicast addresses will not be commited!"));
			return false;
		}
		$scope.McastIpErr = null;
		return true;
	};

	$scope.testTagRemove = function($tag){
		// Action on tag remove 
		$scope.blockTable.entries.value.find(function(m, i) {
			if(m.match($tag.text)) {
				$scope.blockTable.entries.value.splice(i, 1);
				$scope.blockTable.entries.is_dirty = true;
				return m;
			}
		});
	};

	$scope.tagAdded = function($tag){
		var ent = "(*|" + String($tag.text) + ")";
		$scope.blockTable.entries.value.push(ent);
		$scope.blockTable.entries.is_dirty = true;
	};

});
