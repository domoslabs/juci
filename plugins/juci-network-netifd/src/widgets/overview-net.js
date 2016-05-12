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
.directive("overviewWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net.html",
		controller: "overviewWidgetNetwork",
		replace: true
	};
})
.directive("overviewStatusWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net-small.html",
		controller: "overviewWidgetNetwork",
		replace: true
	};
})
.controller("overviewWidgetNetwork", function($scope, $firewall, $tr, gettext, $juciDialog, $uci, $events){
	$scope.defaultHostName = $tr(gettext("Unknown"));
	$scope.model = {};
	$scope.lanNetworks = [];
	var lanNets = [];
	var lanClients = [];
	function refresh(){
		async.series([
			function(next){
				$firewall.getZoneNetworks("lan").done(function(nets){
					lanNets = nets;
					next();
				});
			}, function(next){
				$uci.$sync("dhcp").always(function(){next();});
			}, function(next){
				$firewall.getZoneClients("lan").done(function(clients){
					lanClients = clients;
				}).always(function(){next();});
			}
		], function(){
			var dnss = $uci.dhcp["@dhcp"];
			lanNets.map(function(net){
				net["_uci_dhcp"] = dnss.find(function(dns){
					return dns.interface.value == net[".name"] || dns[".name"] == net[".name"];
				});
				net["_dhcp_enabled"] = net["_uci_dhcp"] && !net["_uci_dhcp"].ignore.value || false;
				return net;
			});
			$scope.lanNetworks = lanNets;
			$scope.lanNetworks.map(function(net){
				net["_clients"] = [];
				lanClients.map(function(client){
					if(client.network === net[".name"]){
						net["_clients"].push(client);
					}
				});
			});
			$scope.numClients = lanClients.filter(function(x){ return x.connected;}).length;
			$scope.$apply();

		});
	}refresh();

	$events.subscribe("client", function(res){
		if(res && res.data && (res.data.action === "disconnect" || res.data.action === "connect")){
			refresh();
		}
	});
	JUCI.interval.repeat("update-lan-overview-widget-slow", 60000, function(done){ refresh(); done();});

	$scope.onEditLan = function(lan){
		if(!lan || lan["_dhcp_enabled"] == undefined) return;
		var model = {
			lan: lan,
			dhcp: lan["_uci_dhcp"],
			dhcpEnabled: lan["_dhcp_enabled"]
		};
		$juciDialog.show("simple-lan-settings-edit", {
			title: $tr(gettext("Edit LAN Settings")),
			buttons: [
				{ label: $tr(gettext("Save")), value: "save", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			on_button: function(btn, inst){
				if(btn.value == "cancel") {
					model.lan.$reset();
					model.dhcp.$reset();
					inst.dismiss("cancel"); 
				}
				if(btn.value == "save") { 
					inst.close();
				}
			},
			model: model
		});
	};
	$scope.onEditClient = function(client){
		var model = {
			client:client
		};
		$juciDialog.show("network-client-edit", {
			buttons: [{ label: $tr(gettext("Close")), value: "cancel"}],
			model:model,
			on_button: function(btn, inst){
				$uci.$sync("firewall").done(function(){
					var del = $uci.firewall["@redirect"].filter(function(re){return re[".new"];});
					if(del){
						del.map(function(d){
							d.$delete().done(function(){
								$scope.$apply();
							});
						});
					}
					inst.close();
				});
			}
		});
	};
});
