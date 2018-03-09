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
.controller("NetworkDslPage", function($scope, $uci, $juciDialog, $tr, gettext){
	$uci.$sync("dsl").done(function(){
		$scope.dslLines = $uci.dsl["@dsl-line"] || [];
		$scope.atmDevices = $uci.dsl["@atm-device"] || [];
		$scope.ptmDevices = $uci.dsl["@ptm-device"] || [];
		$scope.$apply();
		$scope.onCreateDevice = onCreateDevice;
		$scope.onDeleteDevice = onDeleteDevice;
	}).fail(function(e){
		console.error("couldn't sync dsl config", e);
	});

	setAtmDevice = function(){
		if(!$scope.atmDevices || !$scope.atmDevices.length)
			return;
		$scope.atmDevices.forEach(function(dev, index){
			if(!dev || !dev.device)
				return;
			dev.device.value = "atm"+index;
		});
	}

	function onCreateDevice(type){
		var model = {name: "", error:""};
		$juciDialog.show("network-dsl-create-device", {
			model: model,
			on_apply: function(){
				if(!model.name || name_exists(type, model.name)) {
					model.error = $tr(gettext("Name is empty or already in use"));
					return false;
				}
				$uci.dsl.$create({
					".type": type,
					".name": model.name
				}).done(function(dev){
					if(type == "atm-device") {
						setAtmDevice();
						// $scope.atmDevices.forEach(function(dev, index, devices){
						// 	devices[index].device.value = "atm"+dev.$index.current;
						// });
					}
					$scope.$apply();
				}).fail(function(e){
					console.log($tr(gettext("unable to create " + type + " Error: " + e)));
				});
				return true;
			}
		});
		function name_exists(type, name){
			return (($uci.dsl["@all"] || []).find(function(dev){
				return dev[".name"] === name;
			}) !== undefined);
		}
	}

	function onDeleteDevice(dev){
		var devname = dev[".name"];
		if(!dev || !dev.$delete instanceof Function){
			console.error("Trying to delete something not a uci section");
			return;
		}
		dev.$delete().done(function(){
			if(dev[".type"] == "atm-device"){
				setAtmDevice();
			}
			$scope.$apply();
		}).fail(function(e){
			console.error("couldn't delete device " + devname + e);
		});
	}
});
