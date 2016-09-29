//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceAdslEdit", function(){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-adsl-edit.html", 
		controller: "networkDeviceAdslEdit", 
		replace: true
	};  
})
.controller("networkDeviceAdslEdit", function($scope, $network, gettext, $tr, $broadcomDsl){
	$broadcomDsl.getDevices().done(function(devices){
		var baseDevices = devices.filter(function(x){ return x.type == "adsl"; }).map(function(x){
			return {
				label: x.name, 
				value: x.id
			}
		}); 
		
		$scope.linkTypes = [
			{ label: $tr(gettext("EoA")), value: "EoA" }, 
			{ label: $tr(gettext("PPPoA")), value: "PPPoA" }, 
			{ label: $tr(gettext("IPoA")), value: "IPoA" }
		]; 
		
		$scope.encapseoaModes = [
			{ label: $tr(gettext("LLC/SNAP-Bridging")), value: "llcsnap_eth" },
			{ label: $tr(gettext("VC/MUX")), value: "vcmux_eth" }
		]; 

		$scope.encapspppoaModes = [
			{ label: $tr(gettext("LLC/ENCAPSULATION")), value: "llcencaps_ppp" },
			{ label: $tr(gettext("VC/MUX")), value: "vcmux_pppoa" }
		];

		$scope.encapsipoaModes = [
			{ label: $tr(gettext("LLC/SNAP-ROUTING")), value: "llcsnap_rtip" },
			{ label: $tr(gettext("VC/MUX")), value: "vcmux_ipoa" }
		];
		
		$scope.serviceTypes = [
			{ label: $tr(gettext("UBR Without PCR")), value: "ubr" }, 
			{ label: $tr(gettext("UBR With PCR")), value: "ubr_pcr" }, 
			{ label: $tr(gettext("CBR")), value: "cbr" }, 
			{ label: $tr(gettext("Non-Realtime VBR")), value: "nrtvbr" }, 
			{ label: $tr(gettext("Realtime VBR")), value: "rtvbr" }
		]; 
		
		$scope.baseDevices = baseDevices; 
		$scope.$apply(); 
		
	}); 
	$scope.$watch("device", function(value){
		if(!value) return; 
			$scope.conf = value.base || value;
	}); 
}); 
