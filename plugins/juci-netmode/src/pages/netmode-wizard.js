//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>


JUCI.app.controller("netmodeWizardPageCtrl", function($scope, $uci, $languages, $tr, gettext){
	$scope.config = {
		state:"start",
		netmode:"",
		frequency: 5,
		showkey: true,
		2:[],
		5:[],
		ssid:"",
		frequencies: [
			{ label: $tr(gettext("5 GHz")), value: 5 },
			{ label: $tr(gettext("2.4 GHz")), value: 2 }
		]
	};
		
	$scope.isRepeater = function(){
		if(!$scope.netmodes) return false;
		return $scope.netmodes.find(function(nm){
			if(!nm.radio) return false;
			return nm.value === $scope.config.netmode;
		});
	}
	$scope.onFinishWifiRepeaterNetmode = function(){
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
			$rpc.$call("juci.wireless", "set_credentials", {ssid: $scope.config.ssid, key:$scope.config.key, encryption: ap? ap.encryption : "none" }).done(function(){
				var nm = $scope.netmodes.find(function(nm){ return nm.value === $scope.config.netmode; });
				if(nm && nm.reboot) window.location = "/reboot.html";
				$scope.config.state = "done";
				$scope.$apply();
			}).fail(function(e){
				console.log("failed to call juci.wireless set_credentials error: " + JSON.stringify(e));
				$scope.config.error = $tr(gettext("Couldn't set credentials"));
				$scope.$apply();
			});
		}).fail(function(e){
			console.log("failed to save configs error: " + JSON.stringify(e));
			$scope.config.error = $tr(gettext("Couldn't save config!"));
			$scope.$apply();
		});
	 }
	$scope.onfinish = function(){
		window.location = "#!/overview";
	}

	$scope.showKey = function(){
		if(!$scope.config.selected_network || !$scope.config.ssid) return;
		if($scope.config.selected_network === $scope.config.ssid) return;
		$scope.config.showkey = true;
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
		if(ap && !ap.encryption) $scope.config.showkey = false;
		if(ssid){
			$scope.config.ssid = ssid;
			$scope.config.key = "";
		}
	}
	function isCurrentMode(nm){
		return nm && $scope.netmode && $scope.netmode.setup && $scope.netmode.setup.curmode && nm.value === $scope.netmode.setup.curmode.value;
	}
	$scope.onNetmodeSelected = function(){
		if(!$scope.netmodes) return false;
		var nm = $scope.netmodes.find(function(nm){
			return nm.value === $scope.config.netmode;
		})
		if(nm && nm.radio && !isCurrentMode(nm)){
				$scope.config.state = "repeater";
				$scope.reloadSSID();
		}else{
			$scope.netmode.setup.curmode.value = $scope.config.netmode;
			$scope.juci.juci.homepage.value = "overview";
			$uci.$save().done(function(){
				if(nm && nm.reboot && !isCurrentMode(nm)) window.location = "/reboot.html";
				$scope.config.state = 'done';
				$scope.$apply();
			}).fail(function(e){
				console.log(e);
				$scope.config.error = $tr(gettext("Couldn't save configuration"));
				$scope.$apply();
			});
		}
	};
	$scope.needsReboot = function(){
		var nm = ($scope.netmodes || []).find(function(nm){
			return nm.value === $scope.config.netmode;
		});
		if(isCurrentMode(nm)) return false;
		return nm && nm.reboot;
	}
	$scope.reloadSSID = function(){
		if(!$scope.netmodes) return;
		var nm = $scope.netmodes.find(function(nm){return nm.value === $scope.config.netmode});
		if(nm && nm.radio){
			$scope.access_points = undefined;
			$rpc.$call("juci.wireless", "scan", {radio: nm.radio}).done(function(){
				setTimeout(function(){ $rpc.$call("juci.wireless", "scanresults", { radio: nm.radio }).done(function(result){
					if(result && result.access_points){
						$scope.access_points = result.access_points.map(function(ap){
							return { value: ap.ssid, label: ap.ssid, encryption: ap.cipher };
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
					console.log("failed to call juci.wireless scanresults error: " + JSON.stringify(e));
				})}, 3000) // timeout value
			}).fail(function(e){
				console.log("failed to call juci.wireless scan error: " + JSON.stringify(e));
			});
		}
	}
	$uci.$sync(["netmode", "wireless", "juci"]).done(function(){
		$scope.juci = $uci.juci;
		$scope.netmode = $uci.netmode;
		$scope.config.netmode = ($scope.netmode && $scope.netmode.setup && $scope.netmode.setup.curmode) ? $scope.netmode.setup.curmode.value : "";
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
});
