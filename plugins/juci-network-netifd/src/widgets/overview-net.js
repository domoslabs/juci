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
	}
})
.directive("overviewStatusWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net-small.html",
		controller: "overviewWidgetNetwork",
		replace: true
	}
})
.directive("widgetNetworkExpanded", function(){
	return {
		templateUrl: "widgets/overview-net-expanded.html",
		controller: "widgetNetworkExpanded",
		replace: true
	}
})
.controller("widgetNetworkExpanded", function($scope, $uci, $tr, gettext, $events, $network){
	$scope.window = window;
	$scope.order = {};
	$scope.getStyle = function(colName, rowName){
		if(!$scope.order || !$scope.order[colName]) return "";
		return "background-color:" + ($scope.order[colName].column === rowName ? "#ddd" : "white");
	}
	$scope.iconName = function(colName){
		if(!$scope.order || !$scope.order[colName]) return "";
		return "fa fa-caret-" + ($scope.order[colName].reverse ? "down" : "up");
	}
	$scope.showIcon = function(colName, rowName){
		return $scope.order[colName] && $scope.order[colName].column === rowName;
	}
	$scope.style = "overflow:hidden;max-width:0;text-overflow:ellipsis;white-space:nowrap;";
	$uci.$sync("ports").done(function(){
		$scope.ports = {};
		$uci.ports["@ethport"].map(function(port){
			$scope.ports[port.ifname.value] = port.name.value
		});
		$scope.setOrder = function(col, colname){
			if(!$scope.order[colname]) return;
			if($scope.order[colname].column === col) $scope.order[colname].reverse = !$scope.order[colname].reverse;
			$scope.order[colname].column = col;
		}
		var update = function(){
			$network.getConnectedClients().done(function(clients){
				$scope.clients = {};
				$scope.columns = [];
				clients.map(function(client){
					if(!client.connected) return;
					if(client["tx_rate"]) client.tratem = Math.floor(parseInt(client["tx_rate"]) / 100) / 10;
					if(client["rx_rate"]) client.rratem = Math.floor(parseInt(client["rx_rate"]) / 100) / 10;
					var colname = client.frequency ? client.frequency : $tr(gettext("Ethernet"));
					if(!$scope.clients.hasOwnProperty(colname)){
						$scope.clients[colname] = [client];
						$scope.columns.push(colname)
					}else{
						$scope.clients[colname].push(client)
					}
				});
				$scope.columns.map(function(col){
					if(!$scope.order[col]){
						$scope.order[col] = {
							column: "hostname",
							reverse: false
						}
					}
				});
				$scope.$apply()
			}).fail(function(e){
				console.log(e);
			})
		}
		update();
		$events.subscribe("client", function(res){
			if (res && res.data && res.data.action){
				update()
			}
		});
		JUCI.interval.repeat("update-big-clients-widget", 5000, function(next){
			update();
			next()
		})
	}).fail(function(e){
		console.log(e)
	})
})
.controller("overviewWidgetNetwork", function($scope, $firewall, $tr, gettext, $juciDialog, $uci, $events, $config){
	$scope.href = $config.getWidgetLink("overviewWidget10Network")
	$scope.openExpand = function(){
		if (window.innerWidth < 770)
			return;
		$juciDialog.show("widget-network-expanded", {
			title: $tr(gettext("Detailed client overview")),
			buttons: [{
				label: $tr(gettext("Close"))
			}],
			on_button: function(btn, inst){
				inst.close()
			},
			big: true
		})
	}
	;
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
			}).always(function(){
				next();
			})
		},
		function(next){
			$uci.$sync("dhcp").always(function(){
				next();
			})
		},
		function(next){
			$firewall.getZoneClients("lan").done(function(clients){
				lanClients = clients
			}).always(function(){
				next()
			})
		}],
		function(){
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
					var speed = String(client.linkspeed).match(/[0-1]* M/);
					var duplex = String(client.linkspeed).match(/H/) ? "HD" : "FD";
					if(speed && duplex) client["linkspeed_short"] = String(speed).replace(/ /g, "") + " " + duplex;
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
	JUCI.interval.repeat("update-lan-overview-widget-slow", 5000, function(done){ refresh(); done();});

	$scope.onEditLan = function(lan){
		if(!lan || lan["_dhcp_enabled"] == undefined) return;
		var model = {
			lan: lan,
			dhcp: lan["_uci_dhcp"],
			dhcpEnabled: lan["_dhcp_enabled"]
		};
		$juciDialog.show("lan-connection-settings-edit", {
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
