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
.controller("overviewSliderWidget10Network", function($scope, $rpc, $config, $firewall, $events, $tr, gettext, $juciDialog, $wireless){
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
	var hasInternet;
	function getIcon(type, dev){
		switch(type){
			case "wan":
				if(dev.$info.up) return hasInternet ? "img/Internet_Green.png": "img/Internet_Red.png";
				if(dev.$info.pending) return "img/Internet_Yellow.png";
				return "img/Internet_Red.png";
			case "lan":
				if(dev.$info.up) return "img/LanNet_Green.png";
				if(dev.$info.pending) return "img/LanNet_Yellow.png";
				return "img/LanNet_Red.png";
			case "eth":
				if(dev.down) return "img/Ethernet_Red.png";
				if(dev.hosts && dev.hosts.length && dev.hosts.filter(function(dev){ return dev.connected;}).length) return "img/Ethernet_Green.png";
				return "img/Ethernet_Yellow.png";
			case "wl":
				if(dev.down) return "img/Wifi2_Red.png";
				if(dev.hosts && dev.hosts.length && dev.hosts.filter(function(dev){ return dev.connected;}).length) return "img/Wifi2_Green.png";
				return "img/Wifi2_Yellow.png";
			case "cl":
				if(dev.wireless){
					if(!dev.rssi || parseFloat(dev.rssi) < -75) return "img/Laptop_Red.png";
					if(parseFloat(dev.rssi) < -50) return "img/Laptop_Yellow.png";
					return "img/Laptop_Green.png";
				}else{
					if(!dev.linkspeed) return "img/Laptop_Red.png";
					if(dev.linkspeed.match("1000")) return "img/Laptop_Green.png";
					return "img/Laptop_Yellow.png";
				}
			default: return "";
		}
	}
				

	
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
			title: $tr(gettext("Hardware Model")) + ": " + $config.board.system.hardware + "<br />" +
					$tr(gettext("Base MAC")) + ": " + $config.board.system.basemac + "<br />" +
					$tr(gettext("Software Version")) + ": " + $config.board.system.firmware + "<br />" +
					$tr(gettext("Filesystem Type")) + ": " + $config.board.system.filesystem + "<br />",
			size: 60,
			image: "/img/Box_Green.png",
			shape: "image",
		});
		var clients, lan_nets, wan_nets, radios;
		async.series([
			function(next){
				$firewall.getZoneNetworks("lan").done(function(nets){
					lan_nets = nets;
				}).always(function(){next();});
			}, function(next){
				$rpc.$call("led.internet", "status").done(function(data){
					hasInternet = data.state && data.state === "ok";
				}).fail(function(e){console.log(error);}).always(function(){next();});
			}, function(next){
				$firewall.getZoneNetworks("wan").done(function(nets){
					wan_nets = nets;
				}).always(function(){next();});
			}, function(next){
				$rpc.$call("router", "radios").done(function(data){
					radios = data;
				}).always(function(){next();});
			}, function(next){
				function getWanTitle(type, wan, data){
					if(!wan || !wan.$info) return "";
					var t= wan[".name"] + '<br />' + $tr(gettext('Connection Type')) + ': ';
					switch(type){
						case "eth":
							t+= $tr(gettext("Ethernet")) + '<br />';
							t+= $tr(gettext("Link speed")) + ": " + data.linkspeed + "<br />"
							break;
						case "dsl":
							t+= $tr(gettext("DSL")) + '<br />';
							t+= $tr(gettext("Mode")) + ': ' + data.dslstats.mode + '<br />';
							t+= $tr(gettext("Bit Rate")) + '<br />';
							t+= $tr(gettext("Downstream")) + ': ' + parseInt(data.dslstats.bearers[0].rate_down)/1000 + ' Mbit/s<br />';
							t+= $tr(gettext("Upstream")) + ': ' + parseInt(data.dslstats.bearers[0].rate_up)/1000 + ' Mbit/s<br />';
							break;
						case "vwan":
							t+= $tr(gettext("3G/4G")) + '<br />';
							break;
						case "bridge":
							break;
							t+= $tr(gettext("Bridge")) + '<br />';
						default:
							t+= $tr(gettext("Unknown")) + '<br />';
					}
					if(wan.$info["ipv4-address"] && wan.$info["ipv4-address"].length){
						wan.$info["ipv4-address"].map(function(ip){
							t += $tr(gettext("IPv4 address")) + ': ' + ip.address;
						});
					}
					if(wan.$info["ipv6-address"] && wan.$info["ipv6-address"].length){
						wan.$info["ipv6-address"].map(function(ip){
							t += $tr(gettext("IPv6 address")) + ': ' + ip.address;
						});
					}
					return t;
				}
				function addNode(wan, title){
					if(!full) return;
					if(!title) return;
					var node = {
						id: count++,
						label: String(wan[".name"]).toUpperCase().substring(0,10),
						title: title,
						image: getIcon("wan", wan),
						ize: 20,
						shape: "image",
					}
					nodes.push(node);
					edges.push( { from: node.id, to: ".root", width: 3 });
				}
				var up = false;
				async.eachSeries(wan_nets, function(wan, callback){
					var title;
					if(wan.ifname.value.match(/^@.+/) || wan.defaultroute.value === false || !wan.$info){ callback(); return;}
					if(!wan.$info.device){
						title = $tr(gettext("DOWN"));
						addNode(wan, title);
						callback();
					}else if(wan.$info.device.match("eth[0-9]")){
						$rpc.$call("router", "linkspeed", { "interface": wan.$info.device.match("eth[0-9]")[0] }).done(function(data){
							title = getWanTitle("eth", wan, data);
							addNode(wan, title);
						}).fail(function(e){console.log(e);}).always(function(){callback();});
					}else if(wan.$info.device.match("[pa]tm]")){
						$rpc.$call("router", "dslstats").done(function(data){
							if(!data || !data.dslstats || !data.dslstats.bearers || !data.dslstats.bearers.length){ callback(); return;}
							title = getWanTitle("dsl", wan, data);
							addNode(wan, title);
						}).fail(function(e){console.log(e);}).always(function(){callback();});
					}else if(wan.$info.device.match("vwan")){
						title = getWanTitle("vwan", wan);
						addNode(wan, title);
						callback();
					}else if(wan.$info.device.match("br-wan")){
						title = getWanTitle("bridge", wan);
						addNode(wan, title);
						callback();
					}else{
						title = getWanTitle("unknown", wan);
						addNode(wan, title);
						callback();
					}
					up = wan.$info.up;
				}, function(){
					nodes.find(function(node){ return node.id === ".root";}).image = up ? "/img/Box_Green.png" : "/img/Box_Red.png";
					next();});
			}], function(next){
				async.eachSeries(lan_nets, function(item, callback){
					if(!item || !item[".name"] || !item.$info){ callback(); return;}
					$rpc.$call("router", "ports", { "network": item[".name"] }).done(function(data){
						var num_cli = 0;
						Object.keys(data).map(function(dev){
							if(data[dev].hosts && data[dev].hosts.length){
								data[dev].hosts.map(function(host){ if(host.connected) num_cli ++;});
							}
						});
						var node = {
							id: count++,
							label: String(item[".name"]).toUpperCase().substring(0,10),
							title: item[".name"] + '<br />' + $tr(gettext("Number of Clients")) + ": " + num_cli,
							image: getIcon("lan", item),
							size: 20,
							shape: "image",
						}
						nodes.push(node);
						edges.push( { from: ".root", to: node.id, width: 3 });
						Object.keys(data).map(function(device){
							var dev = data[device];
							var dev_node = {
								id: count++,
								label: String((dev.name)?dev.name : dev.ssid).toUpperCase().substring(0,10),
								title: (dev.name)? String(dev.name).toUpperCase() + '<br />' + $tr(gettext("Link speed")) + ': ' + dev.linkspeed :
													String(dev.ssid).toUpperCase() + ' @ ' + ((radios[device.substring(0,3)])? radios[device.substring(0,3)].frequency : $tr(gettext('unknown'))),
								size: 15,
								image: device.match("eth")?getIcon("eth",dev):getIcon("wl", dev),
								shape: "image"
							}
							nodes.push(dev_node);
							edges.push( { from: node.id, to: dev_node.id, width: 3 });
							if(dev.hosts && dev.hosts.length){
								dev.hosts.map(function(host){
									if(!host.connected) return;
									function getHostTitle(host){
										var title = String(host.hostname || host.ipaddr || host.macaddr).toUpperCase() + '<br />';
										[
											["ipaddr", $tr(gettext("IP Address")), ""],
											["macaddr", $tr(gettext("MAC Address")), ""],
											["rssi", $tr(gettext("RSSI")), " dBm"],
											["snr", $tr(gettext("SNR")), ""],
											["tx_rate", $tr(gettext("TX Rate")), " Mbit/s"],
											["rx_rate", $tr(gettext("RX Rate")), " Mbit/s"],
											["linkspeed", $tr(gettext("Linkspeed")), ""]
										].map(function(val){
											if(host[val[0]])
												if(val[0].match("rate"))
													title += val[1] + ': ' + Math.floor(parseInt(host[val[0]])/1000) + val[2] + '<br />';
												else if(val[0].match("macaddr"))
													title += val[1] + ': ' + String(host[val[0]]).toUpperCase() + val[2] + '<br />';
												else
													title += val[1] + ': ' + host[val[0]] + val[2] + '<br />';
										});
										return title;
									}
									var host_node = {
										id: JSON.stringify(host) + count++,
										label: String(host.hostname || host.ipaddr || host.macaddr).toUpperCase().substring(0,10),
										title: getHostTitle(host),
										size: 15,
										image: getIcon("cl", host),
										shape: "image"
									}
									nodes.push(host_node);
									edges.push( { from: dev_node.id, to: host_node.id, width: 3 } );
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
		return self.def
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
			updateData().done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
				$scope.$apply();
			});
		});
		$events.subscribe("network.interface", function(){
			updateData().done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
				$scope.$apply();
			});
		});
	});
});
