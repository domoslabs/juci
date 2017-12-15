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
.controller("InternetFirewallZonesPage", function($scope, $firewall, $uci, $tr, gettext, $juciConfirm){
	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		if(!$scope.zones || !$scope.zones.length) return;
		$scope.zones.map(function(zone){
			zone.$statusList = [["input",$tr(gettext("Input Policy"))], ["output", $tr(gettext("Output Policy"))], ["forward", $tr(gettext("Forward Policy"))]].map(function(pair){
				if(!zone[pair[0]] || !zone[pair[0]].value) return null;
				return { label: pair[1], value: zone[pair[0]].value };
			}).filter(function(f){ return f !== null;});
		});
		$scope.$apply(); 
	}); 
	
	$scope.getItemTitle = function(item){
		return item.name.value; 
	}
	
	$scope.onCreateZone = function(){
		$uci.firewall.$create({
			".type": "zone", 
			"name": "new_zone"
		}).done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteZone = function(zone){
		if(!zone) alert($tr(gettext("Please select a zone to delete!"))); 
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this zone?"))).done(function(){
			zone.$delete().done(function(){
				var rem = [];
				$uci.firewall["@forwarding"].map(function(fw){
					if(fw.src.value == zone.name.value || fw.dest.value == zone.name.value){
						rem.push(fw);
					}
				});
				for(var i = rem.length; i > 0; i--){
					rem[i-1].$delete();
				}
				$scope.$apply(); 
			}); 
		});
	}
	
}); 
