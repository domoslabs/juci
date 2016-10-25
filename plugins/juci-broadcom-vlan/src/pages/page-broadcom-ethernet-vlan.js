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
.controller("PageBroadcomEthernetVlan", function($scope, $uci, $network, gettext, $tr, $juciConfirm){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown";
		return dev.name.value;
	}
	
	$uci.$sync("layer2_interface_vlan").done(function(){
		$scope.vlan_devices = $uci.layer2_interface_vlan["@vlan_interface"] || [];
		$scope.vlan_devices.map(function(vlan){
			vlan.$statusList = [
				[$tr(gettext("Device")), "ifname"],
				[$tr(gettext("802.1q")), "vlan8021q"],
				[$tr(gettext("802.1p")), "vlan8021p"]
			].map(function(pair){
				if(!vlan[pair[1]] || vlan[pair[1]].value === "") return null;
				return { label: pair[0], value: vlan[pair[1]].value };
			}).filter(function(f){ return f !== null; });
		});
		$scope.$apply();
	});
	
	
	$scope.onCreateDevice = function(){
		$uci.layer2_interface_vlan.$create({
			".type": "vlan_interface",
			"name": $tr(gettext("New interface"))
		}).done(function(){
			$scope.$apply();
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert($tr(gettext("Please select a device in the list!")));
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this device?"))).done(function(){
			dev.$delete().done(function(){
				$scope.$apply();
			});
		});
	}
});
