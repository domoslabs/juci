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
			JUCI.interval.repeat("juci-network-slider-big-update", 5000, function(next){
				$scope.model.updateData(true).done(function(nodes, edges){
					network.setData({nodes:nodes, edges:edges});
					$scope.$apply();
				}).always(function(){next();});
			});
		});
		$events.subscribe("client", function(){
			if(!network || !network.setData) return;
			$scope.model.updateData(true).done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
				$scope.$apply();
			});
		});
		$events.subscribe("network.interface", function(){
			if(!network || !network.setData) return;
			$scope.model.updateData(true).done(function(nodes, edges){
				network.setData({nodes: nodes, edges: edges});
				$scope.$apply();
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
	function myString(string){
		if(string.length > 11)
			return string.substring(0, 11) + "...";
		return string;
	}
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
				return hasInternet ? "img/Internet_Green.png": "img/Internet_Red.png";
			case "lan":
				if(dev.up) return "img/LanNet_Green.png";
				if(dev.pending) return "img/LanNet_Yellow.png";
				return "img/LanNet_Red.png";
			case "eth":
				if(dev.down) return "img/Ethernet_Red.png";
				if(dev.hosts && dev.hosts.length && dev.hosts.filter(function(dev){ return dev.connected;}).length) return "img/Ethernet_Green.png";
				return "img/Ethernet_Grey.png";
			case "wl":
				if(dev.frequency === "2.4GHz"){
					if(dev.down) return "img/Wifi_Radio_24_Grey.png";
					return "img/Wifi_Radio_24_Green.png";
				}
				else if( dev.frequency === "5GHz"){
					if(dev.down) return "img/Wifi_Radio_5_Grey.png";
					return "img/Wifi_Radio_5_Green.png";
				}
				return "img/Wifi_Radio_Unknown.png";
			case "cl":
				if(dev.wireless){
					if(!dev.rssi || parseFloat(dev.rssi) < -82) return "img/Wifi_Client_Red.png";
					if(parseFloat(dev.rssi) < -65) return "img/Wifi_Client_Yellow.png";
					return "img/Wifi_Client_Green.png";
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
			label: myString(String($config.board.system.hardware)),
			title: $tr(gettext("Hardware Model")) + ": " + $config.board.system.hardware + "<br />" +
					$tr(gettext("Base MAC")) + ": " + $config.board.system.basemac + "<br />" +
					$tr(gettext("Software Version")) + ": " + $config.board.system.firmware + "<br />" +
					$tr(gettext("Filesystem Type")) + ": " + $config.board.system.filesystem + "<br />",
			size: 60,
			shape: "image",
		});
		var clients, lan_nets, wan_nets, radios, all_nets = [];
		async.series([
			function(next){
				$rpc.$call("network.interface", "dump").done(function(data){
					if(!data || !data.interface){console.log("error getting interfaces"); next();return}
					all_nets = data.interface;
				}).always(function(){next();});
			},
			function(next){
				$rpc.$call("router", "networks").done(function(data){
					Object.keys(data).map(function(k){
						all_nets.find(function(n){
							if(n.interface === k){
								n["defaultroute"] = data[k].defaultroute;
								n["is_alias"] = (data[k].ifname && data[k].ifname.match(/^@.*/)) ? true:false;
								return true;
							}
							return false;
						});
					});
				}).fail(function(e){console.log(e);}).always(function(){next();});
			},
			function(next){
				$firewall.getLanZones().done(function(lan_zones){
					lan_nets = all_nets.filter(function(net){
						if(net.is_alias || !net.defaultroute)return false;
						return lan_zones.find(function(z){
							return z.network && z.network.value && z.network.value.find(function(n){ return n === net.interface;});
						});
					});
				}).always(function(){next();});
			}, function(next){
				$rpc.$call("led.internet", "status").done(function(data){
					hasInternet = data.state && data.state === "ok";
				}).fail(function(e){console.log(e);}).always(function(){next();});
			}, function(next){
				$firewall.getWanZones().done(function(wan_zones){
					wan_nets = all_nets.filter(function(net){
						if(net.is_alias || !net.defaultroute)return false;
						return wan_zones.find(function(z){
							return z.network && z.network.value && z.network.value.find(function(n){ return n === net.interface;});
						});
					});
				}).always(function(){next();});
			}, function(next){
				$rpc.$call("router", "radios").done(function(data){
					radios = data;
				}).always(function(){next();});
			}, function(next){
				function getWanTitle(type, wan, data){
					if(!wan) return "";
					var t= wan.interface + '<br />' + $tr(gettext('Connection Type')) + ': ';
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
					if(wan["ipv4-address"] && wan["ipv4-address"].length){
						wan["ipv4-address"].map(function(ip){
							t += $tr(gettext("IPv4 address")) + ': ' + ip.address;
						});
					}
					if(wan["ipv6-address"] && wan["ipv6-address"].length){
						wan["ipv6-address"].map(function(ip){
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
						label: myString((wan.interface).toUpperCase()),
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
					if(wan.up) up = true;
					var title;
					if(!wan.device){
						title = wan.up ? $tr(gettext("Unknown Working interface")): wan.pending ? $tr(gettext("PENDING")):$tr(gettext("DOWN"));
						addNode(wan, title);
						callback();
					}else if(wan.device.match("eth[0-9]")){
						$rpc.$call("router", "linkspeed", { "interface": wan.device.match("eth[0-9]")[0] }).done(function(data){
							title = getWanTitle("eth", wan, data);
							addNode(wan, title);
						}).fail(function(e){console.log(e);}).always(function(){callback();});
					}else if(wan.device.match(/[ap]tm/)){
						$rpc.$call("router", "dslstats").done(function(data){
							if(!data || !data.dslstats || !data.dslstats.bearers || !data.dslstats.bearers.length){ callback(); return;}
							title = getWanTitle("dsl", wan, data);
							addNode(wan, title);
						}).fail(function(e){console.log(e);}).always(function(){callback();});
					}else if(wan.device.match("vwan")){
						title = getWanTitle("vwan", wan);
						addNode(wan, title);
						callback();
					}else if(wan.device.match("br-wan")){
						title = getWanTitle("bridge", wan);
						addNode(wan, title);
						callback();
					}else{
						title = getWanTitle("unknown", wan);
						addNode(wan, title);
						callback();
					}
				}, function(){
					nodes.find(function(node){ return node.id === ".root";}).image = up ? "/img/Box_Green.png" : "/img/Box_Red.png";
					next();});
			}], function(next){
				async.eachSeries(lan_nets, function(item, callback){
					if(!item || !item.interface){ callback(); return;}
					$rpc.$call("router", "ports", { "network": item.interface }).done(function(data){
						var num_cli = 0;
						Object.keys(data).map(function(dev){
							if(data[dev].hosts && data[dev].hosts.length){
								data[dev].hosts.map(function(host){ if(host.connected) num_cli ++;});
							}
						});
						var node = {
							id: count++,
							label: myString(String(item.interface).toUpperCase()),
							title: item.interface + '<br />' + $tr(gettext("Number of Clients")) + ": " + num_cli,
							image: getIcon("lan", item),
							size: 30,
							shape: "image",
						}
						nodes.push(node);
						edges.push( { from: ".root", to: node.id, width: 3 });
						Object.keys(data).map(function(device){
							var dev = data[device];
							var radio = radios[device.substring(0,3)];
							dev.frequency = (radio)? radio.frequency : $tr(gettext('unknown'));
							dev.down = radio && !radio.isup;
							var dev_node = {
								id: count++,
								label: myString(String(dev.name ? String(dev.name).toUpperCase() : dev.ssid)),
								title: (dev.name)? String(dev.name).toUpperCase() + '<br />' + $tr(gettext("Link speed")) + ': ' + dev.linkspeed :
													dev.ssid + ' @ ' + ((radios[device.substring(0,3)])? radios[device.substring(0,3)].frequency : $tr(gettext('unknown'))),
								size: 30,
								image: device.match("eth")?getIcon("eth",dev):getIcon("wl", dev),
								shape: "image"
							}
							nodes.push(dev_node);
							edges.push( { from: node.id, to: dev_node.id, width: 3 });
							if(dev.hosts && dev.hosts.length){
								dev.hosts.map(function(host){
									if(!host.connected || host.repeated) return;
									function getHostTitle(host){
										var title = host.hostname || String(host.ipaddr).toUpperCase() || String(host.macaddr).toUpperCase() + '<br />';
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
										label: myString(String(host.hostname || String(host.ipaddr).toUpperCase() || String(host.macaddr).toUpperCase())),
										title: getHostTitle(host),
										size: 30,
										image: getIcon("cl", host),
										shape: "image"
									}
									nodes.push(host_node);
									edges.push( { from: dev_node.id, to: host_node.id, width: 3, dashes: (host.wireless) } );
									if(host.assoclist && host.assoclist.length){
										host.assoclist.map(function(asc){
											var assoc_node = {
												id: JSON.stringify(asc) + count ++,
												label: myString(String(asc.hostname || String(host.ipaddr).toUpperCase() || String(host.macaddr).toUpperCase())),
												title: getHostTitle(asc),
												size: 30,
												image: getIcon("cl", host), // get the icon from the repeaters values!!
												shape: "image"
											}
											nodes.push(assoc_node);
											edges.push( { from: host_node.id, to: assoc_node.id, width: 3, dashes: true } );
										});
									}
								});
							}
						});
					}).fail(function(e){console.log(e);}).always(function(){callback();});
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
		JUCI.interval.repeat("juci-network-slider-update", 5000, function(next){
			updateData(false).done(function(nodes, edges){
				network.setData({nodes:nodes, edges:edges});
				$scope.$apply();
			}).always(function(){next();});
		});
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
