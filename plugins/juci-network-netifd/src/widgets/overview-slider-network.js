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
.directive("bigOverviewSliderNetwork", function(){
	return {
		templateUrl: "widgets/slider-network-big.html",
		controller: "bigOverviewSliderNetwork",
		replace: true,
		scope: {
			"model":"=ngModel"
		}
	}
})
.controller("bigOverviewSliderNetwork", function($scope, $events){
	var network;
	var container = document.getElementById('mynetworkBig');
	if($scope.model && $scope.model.updateData && typeof $scope.model.updateData === "function"){
		$scope.model.updateData(true).done(function(nodes, edges){
			var data = {
				nodes: nodes,
				edges: edges
			};
			network = new vis.Network(container, data, $scope.model.options);
		});
		$events.subscribe("client", function(){
			if(!network || !network.setData) return;
			$scope.model.updateData(true).done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
			});
		});
		$events.subscribe("network.interface", function(){
			if(!network || !network.setData) return;
			$scope.model.updateData(true).done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
			});
		});
	}
})
.directive("overviewSliderWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-slider-network.html",
		controller: "overviewSliderWidget10Network",
		replace: true
	};
})
.controller("overviewSliderWidget10Network", function($scope, $rpc, $config, $firewall, $events, $tr, gettext, $juciDialog){
	var optionsFA = {
		autoResize: true,
		nodes: {
			color: "#999999",
			font: {size:15, color:'white' },
			borderWidth: 3
		},
		layout: {
			hierarchical: {
				enabled: true,
				sortMethod: "directed"
			}
		},
		interaction: {
			dragView: false,
			zoomView: false,
			selectable: false
		}
	};
	
	var updateData = function(full){
		var self = this;
		var nodes = [];
		var edges = [];
		if(self.def) return self.def.promise();
		self.def = $.Deferred();
		var count = 0;
		
		nodes.push({
			id: ".root",
			label: $config.board.system.hardware.substring(0,10),
			size: 30,
			image: "/img/net-router-icon.png",
			shape: "image",
		});
		
		var clients, lan_nets, wan_nets;
		async.series([
			function(next){
				$firewall.getZoneNetworks("lan").done(function(nets){
					lan_nets = nets;
				}).always(function(){next();});
			}, function(next){
				$firewall.getZoneNetworks("wan").done(function(nets){
					wan_nets = nets;
				}).always(function(){next();});
			}], function(){
				wan_nets.map(function(wan){
					if(wan.ifname.value.match(/^@.+/) || wan.defaultroute.value == false || !wan.$info || !wan.$info.up) return;
					var node = {
						id: count++,
						label: String(wan[".name"]).toUpperCase().substring(0,10),
						title: String(wan[".name"] + '<br />' + wan.ifname.value),
						image: "/img/net-interface-wan-icon.png",
						size: 30,
						shape: "image",
					}
					nodes.push(node);
					edges.push( { from: node.id, to: ".root", width: 6 });
				});
				async.eachSeries(lan_nets, function(item, callback){
					if(!item || !item[".name"]){ callback(); return;}
					$rpc.$call("router", "ports", { "network": item[".name"] }).done(function(data){
						var node = {
							id: count++,
							label: String(item[".name"]).toUpperCase().substring(0,10),
							title: String(item[".name"] + '<br />' + item.ifname.value),
							image: "/img/net-interface-icon.png",
							size: 30,
							shape: "image",
						}
						nodes.push(node);
						edges.push( { from: ".root", to: node.id, width: 6 });
						Object.keys(data).map(function(device){
							var dev = data[device];
							var dev_node = {
								id: count++,
								label: String((dev.name)?dev.name : dev.ssid).toUpperCase().substring(0,10),
								title: String((dev.name)?dev.name : dev.ssid).toUpperCase() + '<br />' + JSON.stringify(dev),
								size: 30,
								image: device.match("eth")?"/img/lan_port.png":"/img/net-drive-icon.png",
								shape: "image"
							}
							nodes.push(dev_node);
							edges.push( { from: node.id, to: dev_node.id, width: 6 });
							if(!full) return;
							if(dev.hosts && dev.hosts.length){
								dev.hosts.map(function(host){
									var host_node = {
										id: JSON.stringify(host) + count++,
										label: String(host.hostname || host.ipaddr || host.macaddr).toUpperCase().substring(0,10),
										title: JSON.stringify(host),
										size: 30,
										image: "/img/net-laptop-icon.png",
										shape: "image"
									}
									nodes.push(host_node);
									edges.push( { from: dev_node.id, to: host_node.id, width: 6 } );
								});
							}
						});
					}).always(function(){callback();});
				}, function(){
					self.def.resolve(nodes, edges)
					self.def = undefined;
				});
			}
		);
		return self.def;
	}

	$scope.showBigOverview = function(){
		var model = {
			options: optionsFA,
			updateData: updateData,
			w: window
		}
		$juciDialog.show("big-overview-slider-network", {
			title: $tr(gettext("Network Visualization")),
			size: "lg",
			buttons: [ { label: $tr(gettext("Close")), value: "close", primary: true }],
			on_button: function(btn, inst){ inst.close();},
			big: true,
			model: model
		});
	}

	updateData(false).done(function(nodes, edges){ // false indicating not full
		// create a network
		var containerFA = document.getElementById('mynetworkSmall');
		var time = Date.now();
		window.onresize=function(){
			if(Date.now() - time > 100){ //limit the number of time this is called to every 100 ms
				network.setData({nodes: nodes, edges: edges});
				time = Date.now();
			}
		}
		var dataFA = {
			nodes: nodes,
			edges: edges
		};
		var network = new vis.Network(containerFA, dataFA, optionsFA);
		$events.subscribe("client", function(){
			updateData().done(function(){
				network.setData({nodes: nodes, edges: edges});
			});
		});
		$events.subscribe("network.interface", function(){
			updateData().done(function(){
				network.setData({nodes: nodes, edges: edges});
			});
		});
	});
});
