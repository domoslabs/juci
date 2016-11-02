JUCI.app
.directive("overviewWidget99Clientmode", function(){
	return {
		templateUrl: "widgets/overview-clientmode.html",
		controller: "overviewClientmodeCtrl",
		repace: true
	};
}).controller("overviewClientmodeCtrl", function($scope, $uci, $rpc, $tr, gettext, $events, $wireless){
	$scope.showModal = false;
	$scope.modalTitle;
	$scope.manual = {
		ssid: "",
		error: null,
		key: ""
	};
	$scope.automatic = {
		bssid: "",
		error: "",
		key: ""
	}
	$scope.availableAps = [];
	$scope.showManual = {
		value: true,
		toggle: function(){ this.value = !this.value;}
	}
	$scope.showAutomaticPassword = function(){
		if($scope.availableAps.length < 1) return false;
		var sel = $scope.availableAps.find(function(ap){
			return ap.value === $scope.automatic.bssid;
		});
		if(sel && sel.encryption !== "") return true;
		return false;
	}
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
			$scope.manual.error = "";
		};
		$scope.onAutomaticConnect = function(){
			if(!$scope.automatic.bssid){
				$scope.automatic.error = $tr(gettext("Pleace select an AP"));
				return;
			}
			var sel = $scope.availableAps.find(function(ap){
				return ap.value === $scope.automatic.bssid;
			});
			if(!sel) return;
			if(!sel.key || sel.key === ""){
				if($scope.automatic.key === ""){
					$scope.automatic.error = $tr(gettext("You must enter password for thiss SSID"));
					return;
				}
			}
			setValues(sel.label, $scope.automatic.key, $scope.showAutomaticPassword());
			$scope.showManual.value = true;
			$scope.automatic.error = "";
		}
		$scope.$apply();
	});
	$scope.show = function(){
		if(!$scope.settings || !$scope.modes || $scope.settings.curmode.value == "") return false;
		var tmp = $scope.modes.find(function(mode){ return mode[".name"] === $scope.settings.curmode.value; });
		if(tmp && tmp.askcred.value) return true;
		return false;
	}
	$scope.wps = $rpc.$has("router.wps", "pbc_client");
	$scope.onPairWps = function(){
		$rpc.$call("router.wps", "pbc_client");
	}
	function setValues(ssid, key, encr){
		$rpc.$call("juci.wireless", "set_credentials", {
			"ssid":ssid,
			"key":key,
			"encryption":encr
		}).done(function(ret){
			$scope.showModal = true;
			$scope.modalTitle = $tr(gettext("Attempting to Pair"));
			setTimeout(function(){ if($scope.showModal) $scope.showModal = false; window.location.reload(true);}, 30000);
			$scope.$apply();
		});
	}
	$scope.onScanAp = function(){
		var wetIface = $uci.wireless["@wifi-iface"].find(function(iface){ return iface.mode.value === "wet" });
		if(!wetIface){
			alert("no wet interface detected");
			return;
		}
		$wireless.scan({radio:wetIface.device.value}).done(function(){
			$scope.showModal = true;
			$scope.modalTitle = $tr(gettext("Scanning for APs"));
			$scope.$apply();
			setTimeout(function(){
				$wireless.getScanResults({radio:wetIface.device.value}).done(function(result){
					$scope.showManual.value = false;
					$scope.showModal = false;
					$scope.availableAps = result.map(function(ap){
						var encrypt = "";
						if(ap.cipher && !ap.cipher.match(/PSK/)) return null;
						if(ap.cipher) encrypt = "psk2";
						return { label: ap.ssid, value: ap.bssid, encryption: encrypt };
					}).filter(function(ap){ return ap !== null; });
					$scope.$apply();
				});
			}, 3000);
		});
	}
	$events.subscribe("wifi-repeater-success", function(){$scope.showModal = false; $scope.$apply();});
});
