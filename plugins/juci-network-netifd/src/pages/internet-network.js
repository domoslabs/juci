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
.controller("InternetNetworkPage", function($firewall, $scope, $uci, $rpc, $network, $ethernet, $tr, gettext, $juciDialog, $juciConfirm, $juciAlert){
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
		return i[".name"]; 
	}
	
	function evalName(name){
		if(!name) return;
		if(name == "") return $tr(gettext("Interface Name is needed"));
		if(!name.match(/^[a-zA-Z0-9]+$/)) return $tr(gettext("Interface names can only contain letters and numbers"));
		if(name.length > 12) return $tr(gettext("Interface name may only be 12 characters long"));
	}

	$scope.onAddConnection = function(){
		var model = {
			errors: []
		};
		$juciDialog.show("network-connection-create", {
			title: "Create New Network Interface",
			buttons: [
				{ label: $tr(gettext("OK")), value: "ok", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			model: model,
			on_button: function(btn, inst){
				if(btn.value == "cancel"){
					inst.dismiss();
				}
				if(btn.value == "ok"){
					model.errors = [];
					if(!model.name)
						model.errors.push($tr(gettext("The new interface needs a name")));
					var er;
					if((er = evalName(model.name)) != null)
						model.errors.push(er);
					if(model.type == undefined)
						model.errors.push($tr(gettext("The new interface needs an interface type")));
					if(!model.protocol == undefined)
						model.errors.push($tr(gettext("Pleace choose protocol for connection")));
					if(model.errors.length > 0) return;
					if(model.protocol === "dhcp"){
						var vendorid = getVendorID() || "";
						var hostname = getHostname() || "";
					}
					$uci.network.$create({
						".type": "interface",
						".name": model.name, 
						"type": model.type,
						"proto": model.protocol,
						"vendorid": vendorid,
						"hostname": hostname,
						"is_lan": (model.protocol === "static") ? true : false
					}).done(function(interface){
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
						$scope.networks.push(interface); 
						$scope.$apply(); 
					}); 
					inst.close();
				}
			}
		});
	}

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
		if(!$scope.networks) return;
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

	function updateStatus(){
		if(!$scope.networks) return;
		$scope.networks.map(function(net){
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
