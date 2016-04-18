/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

JUCI.app
.directive("overviewWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.html", 
		controller: "overviewWidgetWifi", 
		replace: true
	};  
})
.directive("overviewStatusWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.small.html", 
		controller: "overviewStatusWidgetWifi", 
		replace: true
	};  
})
.controller("overviewStatusWidgetWifi", function($scope, $rpc){
	$scope.wifiRadios = [];
	$rpc.router.radios().done(function(data){
		$scope.wifiRadios = Object.keys(data).map(function(radio){ return data[radio]; });
		$scope.$apply(); 
	});
})
.controller("overviewWidgetWifi", function($scope, $rpc, $uci, $tr, gettext, $juciDialog, $events, $wireless){
	var longPress = false;
	var timeout;
	$scope.wpsColor = "black"
	$scope.mouseDown = function() {
		timeout = setTimeout(function(){longPress = true; $scope.wpsColor = "green"; $scope.$apply();}, 5000);
	}
	$scope.mouseUp = function() {
		if(!longPress){
			if($rpc.wps && $rpc.wps.pbc) $rpc.wps.pbc();
			clearTimeout(timeout);
		}else{
			if($rpc.wps && $rpc.wps.pbc_client) $rpc.wps.pbc_client();
			$scope.wps.progress = 8; 
			$scope.wps.text_status = wps_status_strings[8]; 
			longPress = false;
			$scope.wpsColor = "black";
		}
	}
	var wps_status_strings = {
		"-1": $tr(gettext("Disabled")),
		0: $tr(gettext("Initializing")),
		1: $tr(gettext("Processing")),
		2: $tr(gettext("Done!")),
		3: $tr(gettext("Failed")),
		4: $tr(gettext("Timed out")),
		7: $tr(gettext("Done!")),
		8: $tr(gettext("Switching to repeater mode")),
		9: $tr(gettext("Overlap"))
	}; 
	$scope.wireless = {
		clients: []
	}; 
	$scope.wps = {}; 
	
	$scope.onWPSToggle = function(){
		$scope.wifiStatus.wps.value = !$scope.wifiStatus.wps.value;
	}
	$scope.onWIFISchedToggle = function(){
		if(!$scope.wifiStatus) return;
		$scope.wifiStatus.schedule.value = !$scope.wifiStatus.schedule.value;
	}

	function update_wps(){
		if(!$rpc.wps) return;
		$rpc.wps.status().done(function(result){
			$scope.wps.progress = result.code; 
			$scope.wps.text_status = wps_status_strings[result.code]||gettext("Unknown"); 
			$scope.$apply();	
		}); 
	}update_wps(); 
	$events.subscribe("wps", function(){update_wps();});

	$scope.onEditSSID = function(iface){
		$juciDialog.show("uci-wireless-interface", {
			title: $tr(gettext("Edit wireless interface")),  
			buttons: [
				{ label: $tr(gettext("Save")), value: "save", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			on_button: function(btn, inst){
				if(btn.value == "cancel"){
					iface.$reset();
					inst.dismiss("cancel");
				}
				if(btn.value == "save"){
					inst.close();
				}
			},
			model: iface
		}).done(function(){

		});
	}
	function update_wifi(){
		if(!$rpc.router) return;
		var def = $.Deferred(); 
		$rpc.router.radios().done(function(radios){
			$wireless.getInterfaces().done(function(interfaces){
				$scope.wifs = interfaces.map(function(iface){
					if(!iface.device.value in radios) return null;
					iface.$radio = radios[iface.device.value];
					return iface;
				}).filter(function(x){ return x !== null; });
				if($uci.wireless && $uci.wireless.status) {
					$scope.wifiStatus = $uci.wireless.status; 
				}
				def.resolve();
			}).fail(function(){ def.reject(); });
		}).fail(function(){ def.reject(); });
		return def;
	}
	if($rpc.wps){
		$rpc.wps.showpin().done(function(result){
			$scope.wps.pin = result.pin;
			$scope.$apply();
		});
	}
	JUCI.interval.repeat("wifi-overview", 60000, function(done){
		if($scope && $scope.wifs){
			var tab_info = {};
			$scope.wifs.map(function(wif){
				if(wif && wif._expanded) tab_info[wif.device.value] = wif._expanded;
			});
		}
		update_wifi().done(function(){
			if(!$scope || !$scope.wifs || !tab_info) return;
			$scope.wifs.map(function(wif){
				if(tab_info[wif.device.value]) wif._expanded = tab_info[wif.device.value];
			});
			$scope.$apply();
			done(); 
		}); 
	}); 
	$scope.onCancelWPS = function(){
		$rpc.wps.stop(); 
	} 
}); 
