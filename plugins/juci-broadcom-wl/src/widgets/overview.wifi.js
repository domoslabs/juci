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
.controller("overviewStatusWidgetWifi", function($scope, $uci, $rpc){
	$scope.wifiRadios = [];
	$rpc.juci.wireless.radios().done(function(data){
		$scope.wifiRadios = Object.keys(data).map(function(radio){ return data[radio]; });
		$scope.$apply(); 
	});
})
.controller("overviewWidgetWifi", function($scope, $rpc, $uci, $tr, gettext, $juciDialog){
	$scope.onPairPBC = function(){
		$rpc.juci.wireless.wps.pbc();
	}
	var wps_status_strings = {
		"-1": $tr(gettext("wps.status.disabled")),
		0: $tr(gettext("wps.status.init")),
		1: $tr(gettext("wps.status.processing")),
		2: $tr(gettext("wps.status.success")),
		3: $tr(gettext("wps.status.fail")),
		4: $tr(gettext("wps.status.timeout")),
		7: $tr(gettext("wps.status.msgdone")),
		8: $tr(gettext("wps.status.overlap"))
	}; 
	$scope.wireless = {
		clients: []
	}; 
	$scope.wps = {}; 
	
	$scope.onWPSToggle = function(){
		$scope.wifiStatus.wps.value = !$scope.wifiStatus.wps.value;
	}
	$scope.onWIFISchedToggle = function(){
		$scope.wifiStatus.schedule.value = !$scope.wifiStatus.schedule.value;
	}

	JUCI.interval.repeat("overview.wifi.wps.retry", 1000, function(next){
		$rpc.juci.wireless.wps.status().done(function(result){
			$scope.wps.progress = result.code; 
			$scope.wps.text_status = wps_status_strings[result.code]||gettext("wps.status.unknown"); 
			$scope.$apply();	
			next();
		}); 
	}); 

	$scope.onEditSSID = function(iface){
		$juciDialog.show("uci-wireless-interface", {
			title: $tr(gettext("Edit wireless interface")),  
			buttons: [
				{ label: $tr(gettext("Save")), value: "save", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			on_button: function(btn, inst){
				if(btn.value == "cancel"){
					iface.uci_dev.$reset();
					inst.dismiss("cancel");
				}
				if(btn.value == "save"){
					inst.close();
					iface.ssid = iface.uci_dev.ssid.value;
				}
			},
			model: iface.uci_dev
		}).done(function(){

		});
	}

	function refresh() {
		var def = $.Deferred(); 
		async.series([
			function(next){
				$uci.$sync("wireless").done(function(){
					$rpc.juci.wireless.devices().done(function(result){
						$scope.vifs = $uci.wireless["@wifi-iface"].map(function(iface){
							var dev = result.devices.find(function(dev){
								return iface.ifname.value == dev.device; 
							}); 
							if(!dev) return null;
							dev.uci_dev = iface; 
							return dev; 
						}).filter(function(x){ return x != null; }); 
						if($uci.wireless && $uci.wireless.status) {
							$scope.wifiStatus = $uci.wireless.status; 
						}
					}).always(function(){ next(); }); 
				}); 
			}, 
			function(next){
				if(!$rpc.juci.wireless || !$rpc.juci.wireless.wps) { next(); return; }
				$rpc.juci.wireless.wps.showpin().done(function(result){
					$scope.wps.pin = result.pin; 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.juci.wireless.clients().done(function(clients){
					$scope.wireless.clients = clients.clients; 
					$scope.wireless.clients.map(function(cl){
						// check flags 
						if(cl.flags.match(/NOIP/)) cl.ipaddr = $tr(gettext("No IP address")); 
					}); 
				}).always(function(){
					next();
				});
			}
		], function(){
			$scope.$apply(); 
			def.resolve(); 
		}); 
		return def.promise(); 
	}
	JUCI.interval.repeat("wifi-overview", 10000, function(done){
		if($scope && $scope.vifs){
			var tab_info = {};
			$scope.vifs.map(function(vif){
				if(vif && vif._expanded) tab_info[vif.device] = vif._expanded;
			});
		}
		refresh().done(function(){
			if(!$scope || !$scope.vifsi || !tab_info) return;
			$scope.vifs.map(function(vif){
				if(tab_info[vif.device]) vif._expanded = tab_info[vif.evice];
			});
			$scope.$apply();
			done(); 
		}); 
	}); 
	$scope.onCancelWPS = function(){
		$rpc.juci.wireless.wps.stop(); 
	} 
}); 
