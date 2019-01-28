JUCI.app
.controller("McproxyPageCtrl", function($scope, $uci, $tr, gettext, $juciDialog, $network){
	$uci.$sync("mcproxy").done(function(){
		$scope.mcproxy = $uci.mcproxy['mcproxy'];
		$scope.allInstances = $uci.mcproxy["@instance"] || [];
		$scope.protocol = [{label:'IGMPv1(IPv4)',value:'IGMPv1'},{label:'IGMPv2(IPv4)',value:'IGMPv2'},
			{label:'IGMPv3(IPv4)',value:'IGMPv3'}, {label:'MLDv1(IPv6)', value:'MLDv1'}, {label:'MLDv2(IPv6)',value:'MLDv2'}];
		$scope.allInstances.map(function(instance){
			instance.$statusList = [
				{ label: $tr(gettext("Enable")), value: !(instance.disabled.value) },
				{ label: $tr(gettext("Name")), value: instance.name.value },
				{ label: $tr(gettext("Uplink")), value: instance.upstream.value },
				{ label: $tr(gettext("Downlink")), value: instance.downstream.value },
			];
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
});
