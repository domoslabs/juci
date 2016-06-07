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
.controller("icwmpProvisioningPage", function($scope, $tr, gettext, $uci, $file, $rpc){
	$scope.showPasswd = false;
	$scope.togglepw = function(){$scope.showPasswd = !$scope.showPasswd;};
	$uci.$sync(["provisioning"]).done(function(){
		$scope.general = $uci.provisioning.polling;
		$scope.prov_server = $uci.provisioning.configserver;
		$scope.dhcp_server = $uci.provisioning.iup;
		$scope.uppgrade_server = $uci.provisioning.uppgradeserver;
		$scope.subconfigs = $uci.provisioning["@subconfig"];
		$scope.$apply();
	});
	$scope.times = [];
	for(var i = 100; i < 124; i++){$scope.times[i-100] = { label: i.toString().substr(-2), value: i.toString().substr(-2) }}
	$scope.update_interval = [
		{ label: $tr(gettext("Hourly")),	value: "hourly" },
		{ label: $tr(gettext("Daily")),	value: "daily" },
		{ label: $tr(gettext("Weekly")),	value: "weekly" }
	];
	$scope.onDeleteConf = function(config){
		if(!config) return;
		config.$delete().done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddConf = function(){
		$uci.provisioning.$create({
			".type": "subconfig",
			"enabled":"off"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onExportFile = function() {
		$rpc.$call("juci.provisioning.iup", "run", {"method":"backup", "args":JSON.stringify({"filename":"iup-backup"})}).done(function(){
			$file.downloadFile("iup-backup", "application/gzip", "provisioning-inteno-"+ Date.now()+".tar.gz").fail(function(e){
				alert("error: " + JSON.stringify(e));
			});
		}).fail(function(e){
			alert("error: "+ JSON.stringify(e));
		});
		return;
	};
}); 
