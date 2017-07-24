/* * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.  *
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
.controller("SettingsConfigurationCtrl", function($scope, $rpc, $tr, gettext, $juciDialog, $file, $config, $events, $juciConfirm){
	$scope.data = {encryptBackup:false};
	$scope.sessionID = $rpc.$sid();
	$scope.resetPossible = 0;
	$scope.resetPossible = 1;
	$scope.passwordError = false;

	$events.subscribe("defaultreset", function(e){ window.location = "/reboot.html"; });
	$rpc.$call("juci.sysupgrade", "features", {}).done(function(features){
		$scope.features = features;
		$scope.$apply();
	});

	$scope.onReset = function(){
		$juciConfirm.show($tr(gettext("This will reset your configuration to factory defaults. Do you want to continue?"))).done(function(){
			$rpc.$call("juci.system", "defaultreset", {});
			setTimeout(function(){window.location = "/reboot.html";},0);
		});
	}
	$scope.onSaveConfig = function(){
		$scope.showModal = 1;
	}

	$scope.data = {pass:"",pass_repeat:""};
	$scope.onAcceptModal = function(){
		if($scope.passwordError) return;
		if($scope.data.pass !== $scope.data.pass_repeat) {
			alert($tr(gettext("Passwords do not match!")));
			return;
		}
		if($scope.data.pass === ""){
			if(!confirm($tr(gettext("Are you sure you want to save backup without password?")))) return;
		}
		$scope.showModal = 0;
		$scope.showStatus = 1;
		$rpc.$call("juci.sysupgrade", "create-backup",
			($scope.data.pass ? {"pass": $scope.data.pass} : undefined)
		).done(function(){
			$file.downloadFile("backup.tar.gz", "application/gzip", "backup-" + $config.filename + ".tar.gz").fail(function(e){
				alert($tr(gettext("Was not able to download backup. Please check access!")));
				console.log(e);
			}).always(function(){
				$scope.data = {pass:"",pass_repeat:""};
				$scope.showStatus = false;
				$scope.$apply();
			});
		}).fail(function(error){	$scope.data = {pass:"",pass_repeat:""}; alert("error" + JSON.stringify(error)); });
	}
	$scope.onDismissModal = function(){
		$scope.showModal = 0;
	}
	$scope.$watch("data",function(data){
		if(!data || !data.pass || !data.pass_repeat){
			return;
		}
		if(data.pass.match(/[\W_]/)){
			$scope.passwordError = true;
		}else {
			$scope.passwordError = false;
		}

	},true);
	$scope.$watch("data",function(data){
		if(!data || !data.pass || !data.pass_repeat){
			return;
		}
		if(data.pass.match(/[\W_]/)){
			$scope.passwordError = true;
		}else {
			$scope.passwordError = false;
		}
	},true);
	$scope.$watch("data.encryptBackup",function(eb){
		if(eb){
			$scope.data.pass = "";
			$scope.data.pass_repeat = "";
		}
	});
});
