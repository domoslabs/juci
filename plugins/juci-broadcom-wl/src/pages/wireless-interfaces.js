//! Author: Martin K Schreder <mkschreder@gmail.com>
//! Edit by: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("wirelessInterfacesPage", function($scope, $uci, $wireless, $tr, gettext, prompt, $modal){
	var devices;
	JUCI.interval.repeat("update-wireless-interfaces", 5000, function(next){update(); next();});

	$scope.getItemTitle = function(item){
		if(!item.ifname.value) return item.ssid.value;
		return (item.ssid.value + ' @ ' + item.ifname.value + ' (' + item[".frequency"] + ')');
	}

	function update(){
		$wireless.getDevices().done(function(devs){
			devices = devs;
			$scope.$apply();
		});
		$wireless.getInterfaces().done(function(interfaces){
			$scope.interfaces = interfaces;
			$scope.interfaces.map(function(iface){
				if(!iface.$info) return;
				iface.$statusList = [
					{ label:$tr(gettext("SSID")), value:(iface.$info.ssid || iface.ssid.value)},
					{ label:$tr(gettext("BSSID")), value:(iface.$info.bssid || $tr(gettext("unknown")))},
					{ label:$tr(gettext("Encryption")), value:(iface.$info.encryption || $tr(gettext("unknown")))},
					{ label:$tr(gettext("Mode")), value: String(iface.mode.value || "").toUpperCase()},
					{ label:$tr(gettext("Device")), value: String(iface.device.value || "").toUpperCase()}
				];
			});
			$scope.$apply();
		}).fail(function(er){console.log(er);});
	}

	$scope.onCreateInterface = function(){
		if(!devices){ alert($tr(gettext("Couldn't load wireless radios from config"))); return; }
		var numb = {};
		devices.map(function(dev){ numb[dev[".name"]] = 0; });
		$scope.interfaces.map(function(iface){
			if(numb[iface.device.value] !== undefined) numb[iface.device.value] ++;
		});
		if(Object.keys(numb).filter(function(freq){ return numb[freq] < 4; }).length == 0){
			alert($tr(gettext("No more Wireless Interface spaces left. There can't be more than 4 Interfaces on each radio")));
			return;
		}
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'widgets/wifi-radio-picker-modal.html',
			controller: 'WiFiRadioPickerModal',
			resolve: {
				interfaces: function () {
					return $scope.interfaces;
				}
			}
		});

		modalInstance.result.then(function (data) {
			$uci.wireless.$create({
				".type": "wifi-iface",
				"device": data.radio,
				//"mode": data.mode,
				"ssid": data.ssid
			}).done(function(interface){
				$scope.$apply();
			});
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}

	$scope.onDeleteInterface = function(conn){
		if(!conn) alert($tr(gettext("Please select a connection in the list!")));
		if(confirm($tr(gettext("Are you sure you want to delete this wireless interface?")))){
			conn.$delete().done(function(){
				$scope.$apply();
			});
		}
	}

});
