JUCI.app
.directive("overviewWidget99Clientmode", function(){
	return {
		templateUrl: "widgets/overview-clientmode.html",
		controller: "overviewClientmodeCtrl",
		repace: true
	};
}).controller("overviewClientmodeCtrl", function($scope, $uci, $rpc, $tr, gettext, $events){
	$scope.showModal = false;
	$scope.manual = {
		ssid: "",
		error: null,
		key: ""
	};
	$uci.$sync("netmode").done(function(){
		$scope.settings = $uci.netmode.setup;
		$scope.modes = $uci.netmode["@netmode"];
		$scope.onManualConnect = function(){
			if($scope.manual.ssid === ""){
				$scope.manual.error = $tr(gettext("You must give a SSID to connect"));
				return;
			}
			setValues($scope.manual.ssid, $scope.manual.key, ($scope.manual.key === "" ? "none":"psk2"));
			$scope.manual.ssid = "";
			$scope.manual.key = "";
		};
		$scope.$apply();
	});
	$scope.show = function(){
		if(!$scope.settings || !$scope.modes || $scope.settings.curmode.value == "") return false;
		var tmp = $scope.modes.find(function(mode){ return mode[".name"] === $scope.settings.curmode.value; });
		if(tmp && tmp.askcred.value) return true;
		return false;
	}
	$scope.wps = ($rpc.wps && $rpc.wps.pbc_client);
	$scope.onPairWps = function(){
		if($rpc.wps){
			$rpc.wps.pbc_client();
		}
	}
	function setValues(ssid, key, encr){
		$rpc.juci.client.run({"method":"set","args": JSON.stringify({
			ssid:ssid,
			key:key,
			encryption:encr
		})}).done(function(ret){
			$scope.showModal = true;
			setTimeout(function(){ if($scope.showModal) $scope.showModal = false; $scope.$apply();}, 5000);
			$scope.$apply();
		});
	}
	$events.subscribe("wifi-repeater-success", function(){$scope.showModal = false; $scope.$apply();});
});
