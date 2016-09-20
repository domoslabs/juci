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
.controller("InternetNetworkPage", function($firewall, $scope, $uci, $rpc, $network, $ethernet, $tr, gettext, $juciDialog, $juciConfirm, $juciAlert, $localStorage){
	$scope.data = {}; 

	$ethernet.getAdapters().done(function(devices){
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ 
				return x.ifname.value != "lo" 
			}).map(function(net){ 
				net.addedDevices = []; 
				var addedDevices = net.ifname.value.split(" "); 
				//net.$type_editor = "<network-connection-proto-"+net.type.value+"-edit/>";
				net.addableDevices = devices
					.filter(function(dev){ 
						var already_added = addedDevices.find(function(x){ 
							return x == dev.id; 
						}); 
						if(!already_added){
							return true; 
						} else {
							net.addedDevices.push( { label: dev.name, value: dev.id }); 
							return false; 
						}
					})
					.map(function(dev){ 
						return { label: dev.name, value: dev.id }; 
					}); 
				return net; 
			}); 
			updateStatus();
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.onGetItemTitle = function(i){
		return String(i[".name"]).toUpperCase();
	}
	
	function evalName(name){
		if(!name) return null;
		if(name == "") return $tr(gettext("Interface Name is needed"));
		if(!name.match(/^[a-zA-Z0-9]+$/)) return $tr(gettext("Interface names can only contain letters and numbers"));
		if(name.length > 12) return $tr(gettext("Interface name may only be 12 characters long"));
		return null;
	}

	$scope.onAddConnection = function(){
		var model = {
			name: "",
			type: "",
			errors: []
		};
		async.series([
			function(cb){
				$juciDialog.show("network-connection-create", {
					title: $tr(gettext("Create New Network Interface")),
					buttons: [
						{ label: $tr(gettext("OK")), value: "ok", primary: true },
						{ label: $tr(gettext("Cancel")), value: "cancel" }
					],
					model: model,
					on_button: function(btn, inst){
						model.errors = [];
						if(btn.value === "cancel"){
							inst.close();
							return;
						}
						if(!model.name){
							model.errors.push($tr(gettext("The new interface needs a name")));
						}else{
							var er = evalName(model.name);
							if(er !== null)
								model.errors.push(er);
						}
						if(model.type == "")
							model.errors.push($tr(gettext("Please select the interface type")));
						if(model.errors.length)
							return;
						inst.close();
						console.log("testing");
						cb();
					}
				});
			},
			function(cb){
				$uci.network.$create({
					".type": "interface",
					".name": model.name,
					"is_lan": (model.type === "downlink")?true:false,
					"proto": (model.type === "downlink")?"static":(model.type === "uplink")?"":"none",
				}).done(function(iface){
					model.iface = iface;
					model.errors = [];
					cb();
				}).fail(function(e){console.log(e);alert($tr(gettxt("Error while creating Interface")) + " " + JSON.stringify(e))});
			},
			function(cb){
				$juciDialog.show("network-connection-create-settings", {
					title: $tr(gettext("Finalize Settings")),
					buttons: [
						{ label: $tr(gettext("OK")), value: "ok", primary: true },
						{ label: $tr(gettext("Cancel")), value: "cancel" }
					],
					model: model,
					on_button: function(btn, inst){
						if(btn.value === "cancel"){
							if(model.iface.$delete) model.iface.$delete().done();
							inst.close();
							return;
						}
						model.errors = [];
						if(model.iface.proto.value === "")
							model.errors.push($tr(gettext("Please select Protocol")));
						if(model.errors.length)
							return;
						inst.close();
						cb();
					}
				});
			}
		], function(){
			if(model.zone){
				$firewall.getZones().done(function(zones){
					zones.map(function(zone){
						if(zone.name.value === model.zone){
							zone.network.value = zone.network.value.concat([model.name]);
						}
					});
					$scope.$apply();
				});
			}
			$scope.networks.push(model.iface);
		});
	};

	function getVendorID(){
		if(!$scope.networks || $scope.networks.length < 1) return "";
		var net = $scope.networks.find(function(net){ return net.vendorid.value !== ""; })
		if(net && net.vendorid) return net.vendorid.value;
		return "";
	}
	function getHostname(){
		if(!$scope.networks || $scope.networks.length < 1) return "";
		var net = $scope.networks.find(function(net){ return net.hostname.value !== ""; });
		if(net && net.hostname) return net.hostname.value;
		return "";
	}
	$scope.onDeleteConnection = function(conn){
		if(!conn){
			$juciAlert($tr(gettext("Please select a connection in the list!")));
			return;
		}
		$juciConfirm.show($tr(gettext("Are you sure you want to delete this connection?"))).done(function(result){
			if(result != "ok")return;
			conn.$delete().done(function(){
				var keep = [];
				$firewall.getZones().done(function(zones){
					zones.map(function(zone){
						keep = zone.network.value.filter(function(net){ return net !== conn[".name"]; });
						if(keep.length !== zone.network.value.length){
							zone.network.value = keep;
						}
					});
					$scope.$apply();
				});
				$scope.networks = $scope.networks.filter(function(net){
					return net[".name"] != conn[".name"]; 
				}); 
				$scope.$apply(); 
			}); 
		});
	}
	
	$scope.onAddDevice = function(net, dev){
		if(!dev) return; 
		var devs = {}; 
		net.ifname.value.split(" ").map(function(name){ devs[name] = name; }); 
		devs[dev] = dev; 
		net.ifname.value = Object.keys(devs).join(" "); 
		net.addedDevices = Object.keys(devs).map(function(x){ return { label: x, value: x }; }); 
	}
	JUCI.interval.repeat("update-connection-information", 5000, function(next){
		if(!$scope.networks){
			next();
			return;
		}
		$network.getNetworks().done(function(nets){
			$scope.networks.map(function(net){
				var tmp = nets.find(function(n){ return n[".name"] === net[".name"]; });
				if(tmp && tmp.$info){
					net.$info = tmp.$info;
				}
			});
			updateStatus();
			$scope.$apply();
		}).always(function(){next();});
	});
	var onConnect = function(iface){
		$rpc.$call("network.interface." + iface['.name'], "up");
	}
	var onDisconnect = function(iface){
		$rpc.$call("network.interface." + iface['.name'], "down");
	}

	function updateStatus(){
		if(!$scope.networks) return;
		$scope.networks.map(function(net){
			if(!net.$info) return;
			if(net.$can_edit()){
				net.$buttons = [
					{ label: $tr(gettext("Connect")), on_click: onConnect },
					{ label: $tr(gettext("Disconnect")), on_click: onDisconnect }
				]
			}
			net.$statusList = [
				{ label: $tr(gettext("Status")), value: (net.$info.pending) ? $tr(gettext("PENDING")) : ((net.$info.up) ? $tr(gettext("UP")) : $tr(gettext("DOWN")))},
				{ label: $tr(gettext("Device")), value: net.$info.l3_device},
				{ label: $tr(gettext("Protocol:")), value: net.$info.proto}
			]
			if(net.$info && net.$info['ipv4-address'] && net.$info['ipv4-address'].length){
				net.$info['ipv4-address'].map(function(ipv4){
					net.$statusList.push({ label: $tr(gettext("IPv4-Address")), value: ipv4.address + "/" + ipv4.mask});
				});
			}
			if(net.$info && net.$info['ipv6-address'] && net.$info['ipv6-address'].length){
				net.$info['ipv6-address'].map(function(ipv6){
					net.$statusList.push({ label: $tr(gettext("IPv6-Address")), value: ipv6.address + "/" + ipv6.mask});
				});
			}
		});
	}

	$scope.onRemoveDevice = function(net, name){
		console.log("removing device "+name+" from "+net.ifname.value); 
		var items = net.ifname.value.split(" ").filter(function(x){ return x != name; }); 
		net.addedDevices = items.map(function(x){ return {label: x, value: x}; }); 
		net.ifname.value = items.join(" "); 
	}
}); 
