//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>


JUCI.app.controller("netmodeWizardPageCtrl", function($scope, $uci, $languages, $tr, gettext, $wireless, $file){
	var SCAN_RESLUT_TIMEOUT = 3000;
	var filename = "/tmp/netmode-wizard.json";
	$scope.config = {
		as_extender: true,
		separate_ssids: false,
		once: true,
		show_password: false,
		state: "start",
		interfaces: [],
		frequency: 5,
		ssid: "", // 2.4GHz or both
		ssid5: "",
		key: "", // 2.4GHz or both
		key5: "",
	};

	$uci.$sync(["netmode", "wireless", "juci"]).done(function(){
		$scope.juci = $uci.juci;
		var lang = $languages.getLanguage();
		$scope.nm_setup = $uci.netmode.setup;
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
		if($scope.netmodes_rep.length === 0)
			$scope.config.as_extender = false;

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

	$scope.onFinishWifiRepeaterNetmode = function(){
		if(!$scope.access_points) $scope.access_points = [];
		var ap = $scope.access_points.find(function(ap){
			return ap.value === $scope.config.ssid;
		});
		if(ap && ap.encryption && $scope.config.key === ""){
			$scope.config.error = $tr(gettext("This network is encrypted, Please enter encryption key"));
			return;
		}
		$scope.juci.juci.homepage.value = "overview";
		$uci.$save().done(function(){
			$file.uploadString(filename, JSON.stringify({
				"wifi_ifaces": [
					{
						"ssid": $scope.config.ssid,
						"key": $scope.config.key,
						"band": "a",
						"encryption": $scope.config.key ? "psk2" : "none"
					},
					{
						"ssid": $scope.config.ssid,
						"key": $scope.config.key,
						"band": "b",
						"encryption": $scope.config.key ? "psk2" : "none"
					}
				]
			})).done(function(ret){
				$rpc.$call("repeater", "set_creds", { file: filename, from_gui: "true" }).fail(function(e){
					console.log(e);
				});
				$scope.config.state = "done";
				$scope.$apply();
			}).fail(function(e){
				console.log(e);
			});
		}).fail(function(e){
			console.log("failed to save configs error: " + JSON.stringify(e));
			$scope.config.error = $tr(gettext("Couldn't save config!"));
			$scope.$apply();
		});
	}

	$scope.onFinishWifiRouterNetmode = function(){
		$scope.config.interfaces.map(function(iface){
			if (iface && iface['.frequency']) {
				if (iface['.frequency'] == "2.4GHz") {
					iface.ssid.value = $scope.config.ssid;
					iface.key.value = $scope.config.key;
				}
				else if (iface['.frequency'] == "5GHz") {
					var new_ssid = ($scope.config.separate_ssids) ? $scope.config.ssid5 : $scope.config.ssid;
					iface.ssid.value = new_ssid;
					iface.key.value = $scope.config.key;
				}
			}
		});

		$scope.juci.juci.homepage.value = "overview";
		$scope.nm_setup.repeaterready.value = 0;
		$uci.$save().done(function(){
			window.location = "";
		}).fail(function(e){
			$scope.config.error = "";
			if(e && e instanceof Array){
				e.map(function(er){
					$scope.config.error = $scope.config.error === "" ?
						er : $scope.config.error+"\n"+er;
				});
			}else {
				$scope.config.error = JSON.stringify(e);
			}
			$scope.config.interfaces.map(function(iface){
				iface.ssid.value = iface.ssid.ovalue;
				iface.key.value = iface.key.ovalue;
			});
			$scope.juci.juci.homepage.value = $scope.juci.juci.homepage.ovalue;
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
			$scope.config.key = "";
			$scope.loadAccessPoints();
		}else{
			$scope.onFinishWifiRouterNetmode();

//			$scope.config.state = "router";

//			$wireless.getInterfaces().done(function(data){
//				if(!data || !data.length){
//					console.log("error getting interfaces");
//					return;
//				}
//				$scope.config.interfaces = data;
//				$scope.config.key = data[0].key.value;
//				$scope.config.ssid = data[0].ssid.value;
//				$scope.config.ssid5 = data[0].ssid.value;
//				$scope.$apply();
//			}).fail(function(er){console.log(er);});
		}
	}

	$scope.onSkip = function(){
		if($scope.config.once){
			console.log("once");
			window.location = "#!/overview";
		}else{
			console.log("not once");
			$scope.juci.juci.homepage.value = "overview";
			$uci.$save().done(function(){
				window.location = "";
			}).fail(function(e){
				console.log(e);
				$scope.config.error = $tr(gettext("Couldn't save configuration"));
			});
		}
	}

	$scope.$watch("config.separate_ssids", function(is_separate){
		if(is_separate === undefined) return;
		if($scope.config.interfaces && $scope.config.interfaces.length){
			$scope.config.ssid = $scope.config.interfaces[0].ssid.value;
			$scope.config.ssid5 = $scope.config.interfaces[1].ssid.value;
			$scope.config.key = $scope.config.interfaces[0].key.value;
		}
	}, false);

	$scope.loadAccessPoints = function(){
		if(!$scope.netmodes) return;
		var arch;
		var netmode_name;
		$scope.netmodes.map(function(nm){ 
			if(nm.value.match("_brcm_"))
				arch = "brcm";
			else if(nm.value.match("_mtk_"))
				arch = "mtk"
		});
		if(!$scope.config.as_extender)
			netmode_name = "routed_"+arch;
		else if(arch === "mtk")
			netmode_name = "repeater_mtk_5g_up_dual_down";
		else if(arch === "brcm")
			netmode_name = "repeater_brcm_2g_up_dual_down";

		var nm = $scope.netmodes.find(function(nm){return nm.value === netmode_name});
		if(!nm || !nm.radio){
			console.log("error: couldn't find netmode");
			return;
		}
		$scope.access_points = undefined;
		$wireless.scan({radio: nm.radio}).done(function(){
			setTimeout(function(){
				$wireless.getScanResults({ radio: nm.radio }).done(function(result){
					if(!result)
						return;
					var filtered = [];
					result.forEach(function(ap){
						var found = filtered.find(function(f_ap){return f_ap.ssid === ap.ssid;});
						if(!found)
							filtered.push(ap);
					});
					$scope.access_points = filtered.map(function(ap){
						return { value: ap.ssid, label: ap.ssid, encryption: ap.encryption };
					});

					var index = 0;
					$scope.access_points = $scope.access_points.sort(function(a, b){
						if(a.value && b.value)
							return String(a.value).localeCompare(b.value);
						return 1;
					});
					$scope.$apply();
				}).fail(function(e){
					console.log("failed to call $wireless scanresults error: " + JSON.stringify(e));
				})
			}, SCAN_RESLUT_TIMEOUT);
		}).fail(function(e){
			console.log("failed to call $wireless scan error: " + JSON.stringify(e));
		});
	}
});
