/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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

JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext, intenoQos, $juciDialog, $firewall){
	$uci.$sync(["qos"]).done(function(){
		$scope.qos = $uci.qos["@classify"];
		$scope.ifaces = $uci.qos["@interface"];
		getNetworks();
	});
	function getNetworks(){
		$firewall.getZoneNetworks("wan").done(function(nets){
			$scope.interfaces = nets.filter(function(net){ return !net.ifname.value.match(/^@.*/); })
			.map(function(net){ return {label:String(net.$info.interface).toUpperCase(), value: net.$info.interface}; })
			.filter(function(net){ return !$scope.ifaces.find(function(i){ return i[".name"] == net.value; }); });
			$scope.$apply();
		});
	}
	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ return { label: x, value: x }; }); 
		$scope.$apply(); 
	}); 

	$scope.onAddRule = function(){
		$uci.qos.$create({
			".type": "classify"
		}).done(function(section){
			$scope.$apply(); 
		}); 
	};

	$scope.onAddIface = function(){
		if(!$scope.interfaces || $scope.interfaces.length < 1) return;
		var model = {
			interfaces: $scope.interfaces,
			name: $scope.interfaces[0].value
		}
		$juciDialog.show("add-bw-interface-edit", {
			title: $tr(gettext("Add Bandwidth Limitation")),
			model: model,
			on_apply: function(btn, inst){
				if(!model.name){
					model.error = true;
					return false;
				}
				$uci.qos.$create({
					".type": "interface",
					".name": model.name
				}).done(function(){
					getNetworks();
				});
				return true;
			}
		});
	};

	$scope.onDeleteIface = function(item){
		if(!item) return;
		item.$delete().done(function(){
			getNetworks();
		});
	};

	$scope.getIfaceTitle = function(item){
		if(!item) return "";
		return String(item[".name"]).toUpperCase();
	};

	$scope.onDeleteRule = function(item){
		if(!item) return; 
		item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};

	$scope.onItemMoved = function(){
		$uci.qos.$save_order("classify"); 
	}
});
