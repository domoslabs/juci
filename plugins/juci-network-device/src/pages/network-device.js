/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.controller("NetworkDevicePage", function($scope, $uci, $juciDialog, $tr, gettext, $juciConfirm){
	$uci.$sync("network").done(function(){
		$scope.devices = $uci.network["@device"];
		$scope.onCreateDevice = function(){
			var model = {name:""};
			$juciDialog.show("network-device-create-dialog", {
				model:model,
				size: "md",
				on_apply: function(btn, inst){
					if(model.name === "") {
						model.error = $tr(gettext("Vlan needs a name, press cancel to abort"));
						return false;
					}
					if($scope.devices.find(function(dev){return dev[".name"] === model.name;})){
						model.error = $tr(gettext("Vlan name is already in use"));
						return false;
					}
					//TODO: validate even more for invalid characters etc.
					$uci.network.$create({
						".name": model.name,
						".type": "device"
					}).fail(function(e){
						console.error($tr(gettext("couldn't create new network device (VLAN)")));
					}).always(function(){
						$scope.$apply();
					});
					return true;
				}
			});
		}
		$scope.onDeleteDevice = function(device){
			if(!device) alert($tr(gettext("Please select a device in the list!")));
			$juciConfirm.show($tr(gettext("Are you sure you want to delete this device?"))).done(function(){
				device.$delete().done(function(){
					$scope.$apply();
				});
			});
		}
	});
});
