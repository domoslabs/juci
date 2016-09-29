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
.directive("overviewWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html",
		controller: "overviewWidget20USBCtrl",
		replace: true
	};
})
.directive("overviewStatusWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.small.html",
		controller: "overviewWidget20USBCtrl",
		replace: true
	};
})
.controller("overviewWidget20USBCtrl", function($scope, $uci, $usb, $events, $juciDialog, $tr, gettext, $firewall){
	$events.subscribe("hotplug.usb", function(res){
		if(res.data && res.data.action && (res.data.action == "add" || res.data.action == "remove")){
			update();
		}
	});

	$uci.$sync(["network", "samba"]).done(function(){
		$scope.getColor = function(device){
			if(device.mntdir){
				if($uci.samba["@sambashare"].find(function(sambashare){return sambashare.path.value.match(RegExp(device.mntdir));})){
					return "green";
				}
				return "black";
			}else if(device.netdevice){
				if($uci.network["@interface"].find(function(iface){ return iface.ifname.value === device.netdevice;}))
					return "green";
				return "black";
			}
		}
	});

	function update(){
		$usb.getDevices().done(function(devices){
			$scope.devices = devices || [];
			$scope.$apply();
		});
	}update();

	$scope.createShare = function(device){
		function showModal(sambaShare,addingNew){
			$juciDialog.show("samba-share-edit", {
				title: device.product,
				model: sambaShare,
				buttons: [
					{label: $tr(gettext("Save")), value: "save", primary: "true"},
					{label: $tr(gettext("Delete")), value: "delete"},
					{label: $tr(gettext("Cancel")), value: "cancel"}
				],
				on_button: function(btn,dialog){
					if(btn.value === "save"){ dialog.close(); }
					if(btn.value === "delete"){ sambaShare.$delete().always(function(){dialog.close();}); }
					if(btn.value === "cancel"){
						if (addingNew){ sambaShare.$delete().always(function(){dialog.close();}); }
						else { sambaShare.$reset(); dialog.close(); }
					}
				}
			});
		}

		$uci.$sync("samba").done(function(){
			var existingShare = $uci.samba["@sambashare"].find(function(sambashare){return sambashare.path.value.match(RegExp(device.mntdir))});
			if(existingShare){
				showModal(existingShare,false);
			}
			else{
				$uci.samba.$create({
					".type":"sambashare",
					"name": $tr(gettext("Share for "+device.product)),
					"path": "/mnt/"+device.mntdir
				}).done(function(newShare){
					showModal(newShare,true);
				});
			}
		});

	};
	$scope.createCon = function(device){
		function showConnModal(connection, addingNew, wan_zones){
			var model = { con: connection, zones: wan_zones };
			$juciDialog.show("wwan-connection-edit", {
				title: device.description,
				model: model,
				buttons: [
					{label: $tr(gettext("Save")), value: "save", primary: "true"},
					{label: $tr(gettext("Delete")), value: "delete"},
					{label: $tr(gettext("Cancel")), value: "cancel"}
				],
				on_button: function(btn,dialog){
					if(btn.value === "save"){ dialog.close(); }
					if(btn.value === "delete"){
						wan_zones.map(function(z){ z.network.value = z.network.value.filter(function(n){ return n !== connection[".name"];});});
						connection.$delete().always(function(){dialog.close();});
					}
					if(btn.value === "cancel"){
						if (addingNew){
							wan_zones.map(function(z){ z.network.value = z.network.value.filter(function(n){ return n !== connection[".name"];});});
							connection.$delete().always(function(){dialog.close();});
						}
						else { connection.$reset(); dialog.close(); }
					}
				}
			});
		}

		$uci.$sync(["network"]).done(function(){
			var existingConnection = $uci.network["@interface"].find(function(iface){ return iface.ifname.value === device.netdevice;});
			$firewall.getWanZones().done(function(zones){
				if(existingConnection){
					showConnModal(existingConnection,false, zones);
				}
				else{
					if($uci.network[device.netdevice]){
						alert($tr(gettext(device.netdevice + " connection already exists!")));
						return;
					}
					$uci.network.$create({
						".type":"interface",
						".name":device.netdevice,
						"ifname":device.netdevice,
						"proto":"wwan",
					}).done(function(newCon){
						showConnModal(newCon,true, zones);
					});
				}
			}).fail(function(e){console.log(e);});
		});
	}
});
