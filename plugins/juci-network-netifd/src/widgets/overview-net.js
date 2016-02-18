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
		controller: "overviewStatusWidgetNetwork",
		replace: true
	};
})
.controller("overviewStatusWidgetNetwork", function($scope, $rpc, $firewall){
	$scope.statusClass = "text-success";
	JUCI.interval.repeat("overview-network", 1000, function(done){
		async.series([function(next){
			// TODO: move this to factory
			$firewall.getZoneClients("lan").done(function(clients){
				$scope.numClients = clients.filter(function(x){return x.online}).length;
				$scope.done = 1;
			});
		}], function(){
			done();
		});
	});
})
.controller("overviewWidgetNetwork", function($scope, $firewall, $tr, gettext, $juciDialog, $uci){
	$scope.defaultHostName = $tr(gettext("Unknown"));
	$scope.model = {};
	$scope.lanNetworks = [];
	$firewall.getZoneNetworks("lan").done(function(nets){
		var dnss = [];
		$uci.$sync("dhcp").done(function(){
			dnss = $uci.dhcp["@dhcp"];
			var networks = nets.map(function(net){
				net["_uci_dhcp"] = dnss.find(function(dns){
					return dns.interface.value == net[".name"] || dns[".name"] == net[".name"];
				});
				net["_dhcp_enabled"] = net["_uci_dhcp"] && !net["_uci_dhcp"].ignore.value || false;
				return net;
			});
			console.log(networks);
			$scope.lanNetworks = networks;
			$scope.$apply();
		});
	});

	JUCI.interval.repeat("overview-netowrk-widget", 2000, function(done){
		if($scope.lanNetworks.lenth == 0) return;
		$rpc.router.clients().done(function(data){
			$scope.lanNetworks.map(function(net){
				net["_clients"] = [];
				Object.keys(data).map(function(client){
					if(data[client].network == net[".name"]){
						net["_clients"].push(data[client]);
					}
				});
			});
			$scope.$apply();
		}).always(function(){done();});
	});

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
				pauseSync = false;
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
});
