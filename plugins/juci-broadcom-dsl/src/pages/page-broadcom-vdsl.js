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
.controller("PageBroadcomVdsl", function($scope, $uci, $broadcomDsl, gettext, $tr){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown";
		return dev.name.value;
	}

	var latencyPaths = {
		"1": $tr(gettext("Latency Path 1")),
		"2": $tr(gettext("Latency Path 2")),
		"3": $tr(gettext("Latency Path 1 & 2"))
	};

	var ptmPriorities = {
		"1": $tr(gettext("Normal Priority")),
		"2": $tr(gettext("High Priority"))
	}

	var qosAlos = {
		"1": $tr(gettext("Strict Priority Precedence")),
		"2": $tr(gettext("Weighted Fair Queuing"))
	};

	$broadcomDsl.getDevices().done(function(devices){
		$scope.vdsl_devices = devices.filter(function(dev){
			return dev.type == "vdsl";
		}).map(function(dev){
			return dev.base;
		}).map(function(vdsl){
			vdsl.$statusList = [
				{ label: $tr(gettext("Device")), value: vdsl.ifname.value },
				{ label: $tr(gettext("Latency Path")), value: (latencyPaths[vdsl.dslat.value] || "") },
				{ label: $tr(gettext("PTM Priority")), value: (ptmPriorities[vdsl.ptmprio.value] || "") },
				{ label: $tr(gettext("IP QoS Scheduler Algorithm")), value: (qosAlos[vdsl.ipqos.value] || "") }
			].filter(function(obj){ return obj.value !== ""; });
			return vdsl;
		});
		$scope.$apply();
	});
	
	$scope.onCreateDevice = function(){
		var baseifname = "ptm";
		var next_id = 0;
		// automatically pick an id for the new device
		for(var id = 0; id < 255; id++){
			if(!$uci.layer2_interface_vdsl["@vdsl_interface"].find(function(i){ return String(i.ifname.value).indexOf(baseifname + id) == 0; })){
				next_id = id;
				break;
			}
		}
		$uci.layer2_interface_vdsl.$create({
			".type": "vdsl_interface",
			"name": $tr(gettext("New device")),
			"ifname": baseifname + next_id + ".1",
			"baseifname": baseifname + next_id
		}).done(function(interface){
			$scope.vdsl_devices.push(interface);
			$scope.$apply();
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert($tr(gettext("Please select a device in the list!")));
		if(confirm($tr(gettext("Are you sure you want to delete this device?")))){
			dev.$delete().done(function(){
				$scope.vdsl_devices = $scope.vdsl_devices.filter(function(d){
					return d != dev;
				});
				$scope.$apply();
			});
		}
	}
});
