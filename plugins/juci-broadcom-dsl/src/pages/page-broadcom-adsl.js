/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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
.controller("PageBroadcomAdsl", function($scope, $uci, $broadcomDsl, gettext, $tr, $juciConfirm){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown";
		return dev.name.value;
	}
	$broadcomDsl.getDevices().done(function(devices){
		$scope.adsl_devices = devices.filter(function(dev){
			return dev.type == "adsl";
		}).map(function(dev){
			return dev.base;
		}).map(function(vdsl){
			vdsl.$statusList = [
				[$tr(gettext("Device")), "ifname"],
				[$tr(gettext("VPI")), "vpi"],
				[$tr(gettext("VCI")), "vci"],
				[$tr(gettext("Link type")), "link_type"]
			].map(function(pair){
				if(!vdsl[pair[1]] || vdsl[pair[1]].value === "") return null;
				return { label: pair[0], value: vdsl[pair[1]].value };
			}).filter(function(f){ return f !== null; });
			return vdsl;
		});
		console.log($scope.adsl_devices);
		$scope.$apply();
	});
	
	
	$scope.onCreateDevice = function(){
		var baseifname = "atm";
		var next_id = 0;
		// automatically pick an id for the new device
		for(var id = 0; id < 255; id++){
			if(!$uci.layer2_interface_adsl["@atm_bridge"].find(function(i){ return String(i.ifname.value).indexOf(baseifname + id) == 0; })){
				next_id = id;
				break;
			}
		}
		$uci.layer2_interface_adsl.$create({
			".type": "atm_bridge",
			"name": $tr(gettext("New device")),
			"ifname": baseifname + next_id + ".1",
			"baseifname": baseifname + next_id
		}).done(function(interface){
			$scope.adsl_devices.push(interface);
			$scope.$apply();
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert($tr(gettext("Please select a device in the list!")));
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this device?"))).done(function(){
			dev.$delete().done(function(){
				$scope.adsl_devices = $scope.adsl_devices.filter(function(d){
					return d != dev;
				});
				$scope.$apply();
			});
		});
	}
});
