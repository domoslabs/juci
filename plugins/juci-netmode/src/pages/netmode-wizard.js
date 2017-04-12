//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>


JUCI.app.controller("netmodeWizardPageCtrl", function($scope, $uci, $languages, $tr, gettext, $wireless){
	$scope.config = {
		as_extender: true,
		state:"start",
		netmode:"routed_mtk",
		frequency: 5,
		2:[],
		5:[],
		ssid:"",
		key:"",
		frequencies: [
			{ label: $tr(gettext("5 GHz")), value: 5 },
			{ label: $tr(gettext("2.4 GHz")), value: 2 }
		]
	};
	$scope.data = [];
	$scope.data.separate_ssids = false;
	$scope.data.same_ssid = "";
	$scope.data.same_key = "";
	$scope.data.ssid24 = "";
	$scope.data.ssid5 = "";
	$scope.data.showPassword = false;
	$scope.data.wizardFinished = false;

	$scope.onFinishWifiRepeaterNetmode = function(){
		$scope.data.wizardFinished = true;
		if(!$scope.access_points) $scope.access_points = [];
		var ap = $scope.access_points.find(function(ap){
			return ap.value === $scope.config.ssid;
		});
		if(ap && ap.encryption && $scope.config.key === ""){
			$scope.config.error = $tr(gettext("This network is encrypted, Please enter encryption key"));
			return;
		}
		$scope.netmode.setup.curmode.value = $scope.config.netmode;
		$scope.juci.juci.homepage.value = "overview";
		$uci.$save().done(function(){
			$rpc.$call("juci.wireless", "set_credentials", {ssid: $scope.config.ssid, key:$scope.config.key, encryption: ap? ap.encryption : "none", import : false });
			var nm = $scope.netmodes.find(function(nm){ return nm.value === $scope.config.netmode; });
			if(nm && nm.reboot) window.location = "/reboot.html";
			$scope.config.state = "done";
			$scope.$apply();
		}).fail(function(e){
			console.log("failed to save configs error: " + JSON.stringify(e));
			$scope.config.error = $tr(gettext("Couldn't save config!"));
			$scope.$apply();
		});
	}

	function concatStringsInList(list) {
		var str_out = "";
		function addToOutput(str){ str_out = str_out.indexOf(str)===-1 ? str_out+"\n"+str : str_out; } //dont add duplicates
		list.forEach(addToOutput);
		return str_out;
	}
	function resetRouterModeSettings() {
		for (key in $scope.data.interfaces) {
			var iface = $scope.data.interfaces[key];
			if (iface && iface['.frequency']) {
				if (iface['.frequency'] == "2.4GHz") {
					$scope.data.interfaces[key].ssid.value = $scope.data.interfaces[key].ssid.ovalue;
					$scope.data.interfaces[key].key.value = $scope.data.interfaces[key].key.ovalue;
				}
				else if (iface['.frequency'] == "5GHz") {
					$scope.data.interfaces[key].ssid.value = $scope.data.interfaces[key].ssid.ovalue;
					$scope.data.interfaces[key].key.value = $scope.data.interfaces[key].key.ovalue;
				}
			}
		}
		$scope.juci.juci.homepage.value = $scope.juci.juci.homepage.ovalue;
	}
	$scope.onFinishWifiRouterNetmode = function(){
		$scope.data.wizardFinished = true;
		for (key in $scope.data.interfaces) {
			var iface = $scope.data.interfaces[key];
			if (iface && iface['.frequency']) {
				if (iface['.frequency'] == "2.4GHz") {
					var new_ssid = ($scope.data.separate_ssids) ? $scope.data.ssid24 : $scope.data.same_ssid;
					$scope.data.interfaces[key].ssid.value = new_ssid;
					$scope.data.interfaces[key].key.value = $scope.data.same_key;
				}
				else if (iface['.frequency'] == "5GHz") {
					var new_ssid = ($scope.data.separate_ssids) ? $scope.data.ssid5 : $scope.data.same_ssid;
					$scope.data.interfaces[key].ssid.value = new_ssid;
					$scope.data.interfaces[key].key.value = $scope.data.same_key;
				}
			}
		}

		$scope.juci.juci.homepage.value = "overview";
		$uci.$save().done(function(){
			window.location = "";
		}).fail(function(e){
			$scope.config.error = concatStringsInList(e);//$tr(gettext("Couldn't save configuration"));
			resetRouterModeSettings();
			$scope.$apply();
		});
	}

	$scope.onGoingBack = function(to){
		$scope.config.error = "";
		$scope.config.state = to;
	}
	$scope.updateSSID = function(ssid){
		if(!$scope.access_points) return;
		var ap = $scope.access_points.find(function(ap){
			return ap.value === ssid;
		});
		if(ssid){
			$scope.config.ssid = ssid;
			$scope.config.key = "";
		}
	}

	$scope.onNext = function(){
		if($scope.config.as_extender){
			$scope.config.state = "repeater";
			$scope.config.netmode = "repeater_mtk_5g_up_dual_down";
			$scope.data.same_key = "";
			$scope.loadAccessPoints();
		}else{
			$scope.data.showPassword = false;
			$scope.config.state = "router";
			$scope.config.netmode = "routed_mtk";

			$wireless.getInterfaces().done(function(data){
				if(data.length == 2){
					$scope.data.interfaces = data;
				} else{} // TODO: make sure there is only one iface per frequency?
				$scope.data.same_key = $scope.data.interfaces[0].key.value;
				$scope.data.same_ssid = $scope.data.interfaces[0].ssid.value;
				$scope.data.ssid24 = $scope.data.interfaces[0].ssid.value;
				$scope.data.ssid5 = $scope.data.interfaces[1].ssid.value;
				$scope.$apply();
			}).fail(function(er){console.log(er);});
		}
	};
	$scope.onSkip = function(){
		$scope.juci.juci.homepage.value = "overview";
		$uci.$save().done(function(){
			window.location = "";
		}).fail(function(e){
			console.log(e);
			$scope.config.error = $tr(gettext("Couldn't save configuration"));
		});
	}
	$scope.$watch("data.separate_ssids", function(is_separate){
		try{
			$scope.data.same_ssid = $scope.data.interfaces[0].ssid.value;
			$scope.data.ssid24 = $scope.data.interfaces[0].ssid.value;
			$scope.data.ssid5 = $scope.data.interfaces[1].ssid.value;
			$scope.data.same_key = $scope.data.interfaces[0].key.value;
		}catch(e){ }
	}, false);

	$uci.$sync(["netmode", "wireless", "juci"]).done(function(){
		$scope.juci = $uci.juci;
		$scope.netmode = $uci.netmode;
		var lang = $languages.getLanguage();
		$scope.netmodes = $uci.netmode["@netmode"].map(function(nm){
			return {
				longLabel: nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value,
				label: (nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value).substring(0,20),
				value: nm[".name"],
				desc:  nm[("exp_"+lang)].value || nm.exp.value || nm["exp_en"].value || "",
				band: nm.uplink_band.value,
				reboot: nm.reboot.value
			}
		});
		$scope.netmodes_ap = $scope.netmodes.filter(function(nm){ return !nm.band; });
		$scope.netmodes_rep = $scope.netmodes.filter(function(nm){ return nm.band; });

		$scope.netmodes = $scope.netmodes.map(function(nm){
			if(!nm.band) return nm;
			var radio = $uci.wireless["@wifi-device"].find(function(dev){
				return dev.band.value === nm.band;
			});
			if(radio && radio[".name"]) nm.radio = radio[".name"];
			return nm;
		});
		$scope.$apply();
	});

	$scope.loadAccessPoints = function(){
		if(!$scope.netmodes) return;
		var nm = $scope.netmodes.find(function(nm){return nm.value === $scope.config.netmode});
		if(nm && nm.radio){
			$scope.access_points = undefined;
			$wireless.scan({radio: nm.radio}).done(function(){
				setTimeout(function(){ $wireless.getScanResults({ radio: nm.radio }).done(function(result){
					if(result){
						$scope.access_points = result.map(function(ap){
							return { value: ap.ssid, label: ap.ssid, encryption: ap.encryption };
						});
						var index = 0;
						$scope.access_points = $scope.access_points.sort(function(a, b){
							if(a.value && b.value)
								return String(a.value).localeCompare(b.value);
							return 1;
						});
						$scope.$apply();
					}
				}).fail(function(e){
					console.log("failed to call $wireless scanresults error: " + JSON.stringify(e));
				})}, 3000) // timeout value
			}).fail(function(e){
				console.log("failed to call $wireless scan error: " + JSON.stringify(e));
			});
		}
	}
});
