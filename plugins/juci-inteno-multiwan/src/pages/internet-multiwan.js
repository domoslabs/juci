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
.controller("InternetMultiWANPage", function($juciDialog, $scope, $uci, $rpc, $network, $tr, gettext, $firewall){
	$uci.$sync("multiwan").done(function(){
		$scope.multiwan = $uci.multiwan; 
		$scope.allInterfaces = $uci.multiwan["@interface"].map(function(x){
			return { label: x[".name"], value: x[".name"] }; 
		}); 
		$scope.allInterfaces.push({ label: "Load Balancer (Best Compatibility)", value: "balancer" });
		$scope.allInterfaces.push({ label: "Fast Balancer (Best Distribution)", value: "fastbalancer" });
		$scope.trafic_rules = $uci.multiwan["@mwanfw"];
		$scope.$apply(); 
	}); 
	$scope.onGetItemTitle = function(item){ return item[".name"]; }; 
	$scope.onAddInterface = function(){
		if(!$scope.multiwan) return;
		var freeNets = [];
		$firewall.getZoneNetworks("wan").done(function(nets){
			nets.map(function(net){
				if($scope.multiwan["@interface"].find(function(iface){return iface[".name"] === net[".name"];}) === undefined){
					freeNets.push({ label: String(net[".name"].toUpperCase()), value: net[".name"] });
				}
			});
			if(freeNets.length === 0){
				$juciDialog.show(null, {
					buttons: [{label:$tr(gettext("OK")), value:"ok"}],
					on_button: function(btn, inst){
						inst.close();
					},
					title: $tr(gettext("Error")),
					content: $tr(gettext("No available networks to add!"))
				});
			}else {
				var model = {
					allNets: freeNets || [],
					selected: freeNets[0].value || ""
				};
				$juciDialog.show("multiwan-interface-add", {
					model: model,
					title: $tr(gettext("Add new Interface")),
					on_apply: function(){
						if(model.selected === "") return true;
						$uci.multiwan.$create({
							".type": "interface",
							".name": model.selected,
							"failover_to":"balancer"
						}).done(function(){
							$scope.$apply();
						});
						return true;
					}
				});
			}
		});
		return;
	}
	$scope.onDeleteInterface = function(iface){
		iface.$delete().done(function(){
			$scope.$apply();
		}); 
	}
	$scope.onAddRule = function(){
		$uci.multiwan.$create({ ".type": "mwanfw", "wanrule": "fastbalancer" }).done(function(){
			$scope.$apply();
		});
	};
	$scope.onDeleteRule = function(rule){
		rule.$delete().done(function(){
			$scope.$apply();
		});
	};
	$scope.onGetRuleTitle = function(item){
		if(!item) return "Undefined"; 	
		return 	$tr(gettext("Source addr:")) + " " + ((item.src.value == "") ? $tr(gettext("All")) : item.src.value) + " " + 
				$tr(gettext("Destination addr:")) + " " + ((item.dst.value == "") ? $tr(gettext("All")) : item.dst.value);
	};		
}); 
