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
	if($scope.model && $scope.model.updateData && typeof $scope.model.updateData === "function"){
		var dataFA = {
			nodes: [],
			edges: []
		};
		var time = Date.now();
		var network;
		var options = $scope.model.options || {}
		var updateData = $scope.model.updateData;
		var container = document.getElementById('mynetworkBig');

		function updateNetworkData(nodes, edges){
			dataFA.nodes = nodes;
			dataFA.edges = edges;
			if(!network)
				network = new vis.Network(container, dataFA, options);
			network.setData({nodes: dataFA.nodes, edges: dataFA.edges});
			$scope.$apply();
		}

		// Whenever the window is rezised the network needs to be re-written
		window.onresize=function(){
			if(Date.now() - time > 100){ //limit the number of time this is called to every 100 ms
				network.setData({nodes: dataFA.nodes, edges: dataFA.edges});
				time = Date.now();
			}
		}

		// Update the data for the network every 5s and on every client and network.interface event
		JUCI.interval.repeat("juci-network-slider-big-update", 5000, function(next){
			updateData(true).done(function(nodes, edges){
				updateNetworkData(nodes, edges);
			}).always(function(){next();});
		});
		$events.subscribe("client", function(){
			updateData(true).done(function(nodes, edges){
				updateNetworkData(nodes, edges);
			});
		});
		$events.subscribe("network.interface", function(){
			updateData(true).done(function(nodes, edges){
				updateNetworkData(nodes, edges);
			});
		});
	} else {
		console.error("model.updateData is mandatory and needs to be a function");
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
	$scope.done = false;
	var dataFA = {
		nodes: [],
		edges: []
	};
	var time = Date.now();
	var hasInternet;
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
	// create a network
	var containerFA = document.getElementById('mynetworkSmall');
	var network = new vis.Network(containerFA, dataFA, optionsFA);

	// Main update function
	var updateData = function(full){
		var self = this;
		if(self.def) return self.def.promise();
		self.def = $.Deferred();
		var nodes = [];
		var edges = [];
		var count = 0;
		var up = false;
		var clients, lan_nets, wan_nets, radios, all_nets = [];
		var system = $config.get("board.system") || {};
		
		// Add the static router model
		nodes.push({
			id: ".root",
			label: myString(system.hardware || $tr(gettext("N/A"))),
			title: $tr(gettext("Hardware Model")) + ": " + (system.hardware || $tr(gettext("N/A"))) + "<br />" +
					$tr(gettext("Base MAC")) + ": " + (system.basemac || $tr(gettext("N/A"))) + "<br />" +
					$tr(gettext("Software Version")) + ": " + (system.firmware || $tr(gettext("N/A"))) + "<br />" +
					$tr(gettext("Filesystem Type")) + ": " + (system.filesystem || $tr(gettext("N/A"))) + "<br />",
			size: 60,
			image: "",
			shape: "image",
		});

		function addWanNode(wan, title){
			// only add the wan node if full network is requested
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

		// Gather data
		async.series([
			function(next){
				$rpc.$call("network.interface", "dump").done(function(data){
					if(!data || !data.interface){next("no Interfaces");return}
					lan_nets = all_nets = data.interface;
					next();
				}).fail(function(e){
					self.def.reject();
					self.def = undefined;
				});
			}, function(next){
				$rpc.$call("router.network", "dump").done(function(data){
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
					next();
				}).fail(function(e){
					console.error("ubus call router.network dump failed:", e);
					self.def.reject();
					self.def = undefined;
				});
			}, function(next){
				$rpc.$call("router.network", "clients").done(function(data){
					clients = data;
					next();
				}).fail(function(e){
					console.error("ubus call router.network clients failed:", e);
					self.def.reject();
					self.def = undefined;
				});
			}, function(next){
				$rpc.$call("juci.network", "online").done(function(data){
					hasInternet = data.online;
					next();
				}).fail(function(e){
					console.error("ubus call juci.network online failed:", e);
					self.def.reject();
					self.def = undefined;
				});
			}, function(next){
				$firewall.getWanZones().done(function(wan_zones){
					wan_nets = all_nets.filter(function(net){
						if(net.is_alias || !net.defaultroute)return false;
						return wan_zones.find(function(z){
							return z.network && z.network.value && z.network.value.find(function(n){ return n === net.interface;});
						});
					});
					next();
				}).fail(function(e){
					console.error("failed to get WAN Zones:", e);
					self.def.reject();
					self.def = undefined;
				});
			}, function(next){
				$rpc.$call("router.wireless", "radios").done(function(data){
					radios = data;
					next();
				}).fail(function(e){
					console.error("ubus call router.wireless radios failed:", e);
					self.def.reject();
					self.def = undefined;
				});
			}, function(next) {
				async.eachSeries(wan_nets, function(wan, callback){
					if(wan && wan.up) up = true;
					if(!wan || !full){
						//only calculate the data for the wan
						//node if it is going to be shown
						callback();
						return;
					}
					var title;
					if(!wan.device){
						title = wan.up ? $tr(gettext("Unknown Working interface")): wan.pending ? $tr(gettext("PENDING")):$tr(gettext("DOWN"));
						addWanNode(wan, title);
						callback();
					}else if(wan.device.match("eth[0-9]")){
						$rpc.$call("router.port", "status", { "port": wan.device.match("eth[0-9]")[0] }).done(function(data){
							title = getWanTitle("eth", wan, data);
							addWanNode(wan, title);
						}).fail(function(e){
							console.error("ubus call router.port status failed:", e);
						}).always(function(){
							callback();
						});
					}else if(wan.device.match(/[ap]tm/)){
						$rpc.$call("dsl", "status").done(function(data){
							if(!data || !data.line || data.line.length < 1 || !data.line[0].channel || data.line[0].channel.length < 1){
								callback();
								return;
							}
							title = getWanTitle("dsl", wan, data.line[0]);
							addWanNode(wan, title);
						}).fail(function(e){
							console.error("ubus call dsl status failed:", e);
						}).always(function(){
							callback();
						});
					}else if(wan.device.match("wwan")){
						title = getWanTitle("wwan", wan);
						addWanNode(wan, title);
						callback();
					}else if(wan.device.match("br-wan")){
						title = getWanTitle("bridge", wan);
						addWanNode(wan, title);
						callback();
					}else{
						title = getWanTitle("unknown", wan);
						addWanNode(wan, title);
						callback();
					}
				}, function(){
					// set the icon of the router node depending on wan up status
					nodes.find(function(node){ return node.id === ".root";}).image = up ? "/img/Box_Green.png" : "/img/Box_Red.png";
					next();
				});
			}, function(next) {
				async.eachSeries(lan_nets, function(item, callback){
					if(!item || !item.interface){
						callback();
						return;
					}
					$rpc.$call("router.network", "ports", { "network": item.interface }).done(function(data){
						var num_cli = 0;
						var num_ports = 0;
						Object.keys(data).map(function(dev){
							num_ports++;
							if(data[dev].hosts && data[dev].hosts.length){
								data[dev].hosts.map(function(host){ if(host.connected) num_cli ++;});
							}
						});

						if(num_ports === 0){
							console.error("num_ports = 0");
							return;
						}
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
							var radio;
							if (device.match("ra"))
								radio = radios[device.replace(/[0-9]/g, '0')];
							else if (device.match("wlan"))
								radio = radios[device.substring(0,5)];
							else
								radio = radios[device.substring(0,3)];
							dev.frequency = (radio)? radio.frequency : $tr(gettext('unknown'));
							dev.down = radio && !radio.isup;
							var dev_node = {
								id: count++,
								label: myString(String(dev.name ? String(dev.name).toUpperCase() : dev.ssid)),
								title: getPortTitle(dev, device, radio),
								size: 30,
								image: device.match("eth")?getIcon("eth",dev):getIcon("wl", dev),
								shape: "image"
							}
							nodes.push(dev_node);
							edges.push( { from: node.id, to: dev_node.id, width: 3 });
							if(dev.hosts && dev.hosts.length){
								dev.hosts.map(function(host){
									if(!host.connected || host.repeated) return;

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
											for (var key in clients) {
												client = clients[key];
												if (client.macaddr === asc.macaddr && client.active_connections != undefined)
													asc.active_connections = client.active_connections;
											};

											var assoc_node = {
												id: JSON.stringify(asc) + count ++,
												label: myString(String(asc.hostname || String(host.ipaddr).toUpperCase() || String(host.macaddr).toUpperCase())),
												title: getHostTitle(asc),
												size: 30,
												image: getIcon("asc", (asc.rssi)?{wireless:true, rssi:asc.rssi}:host), // get the icon from the repeaters values!!
												shape: "image"
											}


											nodes.push(assoc_node);
											edges.push( { from: host_node.id, to: assoc_node.id, width: 3, dashes: true } );
										});
									}
								});
							}
						});
						// we do not handle error because this ubus call will frequently fail due to invalid input
					}).always(function(){
						callback();
					});
				}, function() {
					next();
				});
			}
		], function(){
			self.def.resolve(nodes, edges)
			self.def = undefined;
		});
		return self.def;
	}

	// onClick function for the slider
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
			on_button: function(btn, inst){
				JUCI.interval.clear("juci-network-slider-big-update");
				inst.close();
			},
			big: true,
			model: model
		});
	}

	// Whenever the window is rezised the network needs to be re-written
	window.onresize=function(){
		if(Date.now() - time > 100){ //limit the number of time this is called to every 100 ms
			network.setData({nodes: dataFA.nodes, edges: dataFA.edges});
			time = Date.now();
		}
	}

	// Update the data for the network every 5s and on every client and network.interface event
	JUCI.interval.repeat("juci-network-slider-update", 5000, function(next){
		updateData(false).done(function(nodes, edges){
			$scope.done = true;
			updateNetworkData(nodes, edges);
		}).always(function(){next();});
	});
	$events.subscribe("client", function(){
		updateData().done(function(nodes, edges){
			updateNetworkData(nodes, edges);
		});
	});
	$events.subscribe("network.interface", function(){
		updateData().done(function(nodes, edges){
			updateNetworkData(nodes, edges);
		});
	});

//############################ HELPER FUNCTIONS #############################################

	function getIcon(type, dev){
		if(!dev) return;
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
					if(dev.linkspeed.match("1000") || dev.linkspeed === "Auto") return "img/Laptop_Green.png";
					return "img/Laptop_Yellow.png";
				}
			case "asc":
				if(dev.wireless){
					return getIcon("cl", dev);
				}else{
					if(!dev.linkspeed) return "img/Wifi_Client_Red.png";
					if(dev.linkspeed.match("1000")) return "img/Wifi_Client_Green.png";
					return "img/Wifi_Client_Yellow.png";
				}
			default: return "";
		}
	}

	function myString(string){
		if(string.length > 11)
			return string.substring(0, 11) + "...";
		return string;
	}

	function humanize(str) {
		if (!str)
			return;

		var words = str.split('_');
		for (i = 0; i < words.length; i++)
			words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);

		return words.join(' ');
	}

	function updateNetworkData(nodes, edges){
		dataFA.nodes = nodes;
		dataFA.edges = edges;
		network.setData({nodes: dataFA.nodes, edges: dataFA.edges});
		$scope.$apply();
	}

	function getPortTitle(dev, device, radio){
		function fixBytes(bytes){
			if(isNaN(bytes)) return "";
			var i = parseInt(bytes);
			if(i < 1000) return i + " B"
			if(i < 1000000) return Math.round((i/1000)*10)/10 + " kB";
			return Math.round((i/1000000)*10)/10 + " MB";
		}
		var wired = (dev && dev.name);
		var title;
		if(wired)
			title = String(dev.name).toUpperCase() + '<br />' + $tr(gettext("Link speed")) + ': ' + dev.linkspeed;
		else
			title = dev.ssid + ' @ ' + (radio.frequency ? radio.frequency : $tr(gettext('unknown')));
		return title;
	}

	function getWanTitle(type, wan, data){
		if(!wan) return "";
		var t= wan.interface + '<br />' + $tr(gettext('Link Type')) + ': ';
		switch(type){
			case "eth":
				t+= $tr(gettext("Ethernet")) + '<br />';
				t+= $tr(gettext("Link speed")) + ": " + data.speed + "<br />"
				break;
			case "dsl":
				t+= $tr(gettext("DSL")) + '<br />';
				t += $tr(gettext("Mode")) + ': ' + humanize(data.standard_used) + '<br />';
				t+= $tr(gettext("Bit Rate")) + '<br />';
				t+= $tr(gettext("Downstream")) + ': ' + parseInt(data.channel[0].actndr.ds)/1000 + ' Mbit/s<br />';
				t+= $tr(gettext("Upstream")) + ': ' + parseInt(data.channel[0].actndr.us)/1000 + ' Mbit/s<br />';
				break;
			case "vwan":
				t+= $tr(gettext("3G/4G")) + '<br />';
				break;
			case "bridge":
				t+= $tr(gettext("Bridge")) + '<br />';
				break;
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

	function getHostTitle(host){
		var title = (host.hostname || String(host.ipaddr).toUpperCase() || String(host.macaddr).toUpperCase()) + '<br />';
		[
			["ipaddr", $tr(gettext("IP Address")), ""],
			["ip6addr", $tr(gettext("IPv6 Address")), ""],
			["macaddr", $tr(gettext("MAC Address")), ""],
			["rssi", $tr(gettext("RSSI")), " dBm"],
			["snr", $tr(gettext("SNR")), ""],
			["tx_rate", $tr(gettext("TX Rate")), " Mbit/s"],
			["rx_rate", $tr(gettext("RX Rate")), " Mbit/s"],
			["linkspeed", $tr(gettext("Linkspeed")), ""],
			["active_connections", $tr(gettext("Active Connections")), ""]
		].map(function(val){
			if(host[val[0]] != undefined)
				if(val[0].match("rate"))
					title += val[1] + ': ' + Math.floor(parseInt(host[val[0]])/1000) + val[2] + '<br />';
				else if(val[0].match("macaddr"))
					title += val[1] + ': ' + String(host[val[0]]).toUpperCase() + val[2] + '<br />';
				else
					title += val[1] + ': ' + host[val[0]] + val[2] + '<br />';
		});
		return title;
	}
});
