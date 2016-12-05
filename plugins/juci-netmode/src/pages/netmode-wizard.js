//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>


JUCI.app.controller("netmodeWizardPageCtrl", function($scope, $uci, $languages, $tr, gettext){
	$scope.config = {
		state:"start",
		netmode:"",
		frequency: 5,
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
		var nm = $scope.netmodes.find(function(nm){
			if(!nm.radio) return false;
			return nm.value === $scope.config.netmode;
		});
		return nm !== undefined;
	}
	$scope.onNetmodeSelected = function(){
		if($scope.config.netmode && $scope.config.netmode.radio){
			$scope.config.state = "repeater";
		}
	};
	$uci.$sync(["netmode", "wireless"]).done(function(){
		var lang = $languages.getLanguage();
		$scope.netmodes = $uci.netmode["@netmode"].map(function(nm){
			return {
				longLabel: nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value,
				label: (nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value).substring(0,20),
				value: nm[".name"],
				desc:  nm[("exp_"+lang)].value || nm.exp.value || nm["exp_en"].value || "",
				band: nm.uplink_band.value
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
