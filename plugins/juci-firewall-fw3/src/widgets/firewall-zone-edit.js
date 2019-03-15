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
.directive("firewallZoneEdit", function(){
	return {
		scope: {
			zone: "=ngModel"
		},
		controller: "firewallZoneEdit",
		templateUrl: "/widgets/firewall-zone-edit.html"
	};
})
.controller("firewallZoneEdit", function($scope, $firewall, $network, networkConnectionPicker, $uci, $tr, gettext, $juciConfirm){
	$scope.policys = [
		{ label: $tr(gettext("ACCEPT")), value: "ACCEPT" },
		{ label: $tr(gettext("REJECT")), value: "REJECT" },
		{ label: $tr(gettext("DROP")), value: "DROP" },
		{ label: $tr(gettext("FORWARD")), value: "FORWARD" }
	];
	
	function zoneValidator(){
		this.validate = function(opt){
			if(!$uci.firewall || !$scope || !$scope.zone) return null
			var zones = $uci.firewall["@zone"].filter(function(z){ return z[".name"] != $scope.zone[".name"]; });
			if(zones.find(function(z){ return z.name.value == opt.value; }) != undefined) return $tr(gettext("Firewall Zones can't have the same name"));
			return null;
		};
	}

	$scope.$watch("zone", function(zone){
		$scope.zones = {source:[], dest:[]}
		if(!zone) return;
		zone.name.validator = new zoneValidator();
		$firewall.getZones().done(function(zones){
			var others = zones.filter(function(z){
				return z.name.value != zone.name.value
			}).map(function(z){
				return { name:z.name.value };
			});
			$uci.$sync("firewall").done(function(){
				var forwards = $uci.firewall["@forwarding"];
				others.map(function(other){
					// when src is other and dest is me
					var match = forwards.find(function(fw){
						return fw.src.value == other.name &&
							fw.dest.value == zone.name.value;
					});
					$scope.zones.source.push({
						name: other.name,
						selected: (match ? true : false)
					});
					// when src is me and dest is other
					match = forwards.find(function(fw){
						return fw.dest.value == other.name &&
							fw.src.value == zone.name.value;
					});
					$scope.zones.dest.push({
						name: other.name,
						selected: (match ? true : false)
					});
				});
				$scope.changeForwards = function(){
					// 1. remove all unvalid forwards
					forwards.forEach(function(fw){
						// src
						var match = $scope.zones.source.find(function(src){
							if (fw.dest.value !== zone.name.value) return false;
							return src.selected && src.name === fw.src.value
						});
						if(match)
							return;
						// dst
						var match = $scope.zones.dest.find(function(dest){
							if (fw.src.value !== zone.name.value) return false;
							return dest.selected && dest.name === fw.dest.value
						});
						if(match)
							return;
						fw.$delete().done(function(){
							$scope.$apply();
						});
					});
					// 2. add missing forwards
					// 2.1 add from src
					$scope.zones.source.forEach(function(src){
						if (!src.selected) return;
						var match = forwards.find(function(fw){
							return fw.dest.value === zone.name.value && fw.src.value === src.name;
						});
						if(!match) {
							//create matching roule
							$uci.firewall.$create({
								".type":"forwarding",
								"src": src.name,
								"dest": zone.name.value
							}).done(function(){
								$scope.$apply();
							});
						}

					});
					// 2.2 add from dest
					$scope.zones.dest.forEach(function(dest){
						if (!dest.selected) return;
						var match = forwards.find(function(fw){
							return fw.src.value === zone.name.value && fw.dest.value === dest.name;
						});
						if(!match) {
							//create matching roule
							$uci.firewall.$create({
								".type":"forwarding",
								"dest": dest.name,
								"src": zone.name.value
							}).done(function(){
								$scope.$apply();
							});
						}

					});
				};
				$scope.$apply();
			});
		});
	});
	
	$scope.getItemTitle = function(net){
		return net;
	}
	
	
	$scope.onAddNetwork = function(){
		if(!$scope.zone) return;
		networkConnectionPicker.show({ exclude: $scope.zone.network.value }).done(function(network){
			$scope.zone.network.value = $scope.zone.network.value.concat([network[".name"]]);;
		});
	}
	
	$scope.onRemoveNetwork = function(conn){
		if(!$scope.zone) return;
		if(!conn) alert($tr(gettext("Please select a connection in the list!")));
		$juciConfirm.show($tr(gettext("Are you sure you want to remove this network from this zone?"))).done(function(){
			$scope.zone.network.value = $scope.zone.network.value.filter(function(name){
				return name != conn;
			});
		});
	}
	
}).filter("uppercase", function(){
	return function(string){
		return String(string).toUpperCase();
	};
});
