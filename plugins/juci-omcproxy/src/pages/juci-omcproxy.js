//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("OmcproxyPageCtrl", function($scope, $uci, $tr, gettext, $juciDialog){
	$uci.$sync("omcproxy").done(function(){
		$scope.allProxies = $uci.omcproxy["@proxy"] || [];
		$scope.allProxies.map(function(proxy){
			proxy.$statusList = [
				{ label: $tr(gettext("Uplink")), value: String(proxy.uplink.value).toUpperCase() },
				{ label: $tr(gettext("Downlink")), value: "[" + proxy.downlink.value + "]" },
				{ label: $tr(gettext("Scope")), value: proxy.scope.value },
			];
		});
		$scope.$apply();
	}).fail(function(e){console.log(e);});
	$scope.getOmcProxyTitle = function(item){
		var na = $tr(gettext("N/A"));
		return String((item.uplink.value ||  na) + " => [" + (item.downlink.value) +
				"] (" + item.scope.value + ")");
	}
	$scope.onAddProxy = function(){
		var model = {};
		$uci.omcproxy.$create({
			".type":"proxy",
		}).done(function(proxy){
			$scope.$apply();
		});
	}

	$scope.onDeleteProxy = function(item){
		if(!item || !item.$delete) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	}
});
