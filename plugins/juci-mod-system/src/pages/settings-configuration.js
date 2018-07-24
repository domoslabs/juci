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
.controller("SettingsConfigurationCtrl", function($scope, $rpc, $tr, gettext, $juciDialog, $file, $config, $events, $juciConfirm, $uci){
	$scope.data = {encryptBackup:false};
	$scope.sessionID = $rpc.$sid();
	$scope.resetPossible = 0;
	$scope.resetPossible = 1;
	$scope.passwordError = false;
	var filename = "/tmp/juci/backup.tar.gz";

	$events.subscribe("defaultreset", function(e){ window.location = "/reboot.html"; });
	$rpc.$call("juci.sysupgrade", "features", {}).done(function(features){
		$scope.features = features;
		$scope.$apply();
	});

	$scope.soft = {
		is_repeater: true,
		soft: false,
		wifi: true,
		fw_redirect: true,
		fw_parental: true,
		passwd_user: true,
		ice: true
	};

	/* set is_repeater
	 * use is_repeater to hide soft reset section
	 * should be removed when soft reset will work for repeaters
	 */
	$uci.$sync("netmode")
		.done(function() {
			if (!$uci.netmode.setup || !$uci.netmode.setup.curmode) {
				$scope.soft.is_repeater = false;
				$scope.$apply();
				return;
			}

			var curmode = $uci.netmode.setup.curmode.value;

			if (!$uci.netmode[curmode] || !$uci.netmode[curmode].uplink_band) {
				$scope.soft.is_repeater = false;
				$scope.$apply();
				return;
			}

			var uplinkband= $uci.netmode[curmode].uplink_band.value;

			if (!uplinkband) {
				$scope.soft.is_repeater = false;
				$scope.$apply();
			}
		}
	);


	$scope.onReset = function(){
		$juciConfirm.show($tr(gettext("This will reset your configuration to factory defaults (except the settings selected to be saved). Do you want to continue?"))).done(function(){
			$rpc.$call("juci.system", "defaultreset", {
				"soft":		$scope.soft.soft ?	"true" : "false",
				"wifi":		$scope.soft.wifi ?	"true" : "false",
				"fw_redirect":	$scope.soft.fw_redirect?"true" : "false",
				"fw_parental":	$scope.soft.fw_parental?"true" : "false",
				"passwd_user":	$scope.soft.passwd_user?"true" : "false",
				"ice":		$scope.soft.ice ?	"true" : "false"
			});
			setTimeout(function(){window.location = "/reboot.html";},0);
		});
	}

	$scope.$watch("soft",function(soft){
		if ( !soft.wifi && !soft.fw_redirect && !soft.fw_parental && !soft.passwd_user && !soft.ice) {
			soft.soft = false;
			soft.wifi = soft.fw_redirect = soft.fw_parental = soft.passwd_user = soft.ice = true;
		}
	}, true);

	$scope.onSaveConfig = function(){
		$scope.showModal = 1;
	}

	$scope.onRestoreConfig = function(){
		$scope.showUploadModal = 1;
	}
	$scope.onCancelRestore = function(){
		$scope.showUploadModal = 0;
	}
	$scope.data = {pass:"",pass_repeat:""};
	$scope.onUploadConfig = function(){
		var upfile = document.getElementById("upload");
		if(!upfile.name || upfile.size < 1) return;
		$file.uploadFile(filename, upfile.files[0]).done(function(){
			onUploadComplete(upfile.name);
		}).fail(function(e){console.log(e);});
	}
	function onUploadComplete(result){
		console.log("Uploaded: "+JSON.stringify(result));
		$rpc.$call("juci.sysupgrade", "restore-backup", {
			"pass": $scope.data.pass
		}).done(function(result){
			if(result.error){
				alert(result.error);
			} else {
				$scope.showUploadModal = 0;
				$scope.$apply();
				$juciConfirm.show($tr(gettext("Configuration has been restored. You need to reboot the device for settings to take effect! Do you want to reboot now?"))).done(function(){
					$rpc.$call("juci.system", "reboot", {});
					setTimeout(function(){window.location = "/reboot.html";}, 0);
				});
			}
		}).fail(function(err){
			console.error("Filed: "+JSON.stringify(err));
		}).always(function(){
			$scope.data = {pass:"",pass_repeat:""};
			$scope.$apply();
		});
	}
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
			$file.downloadFile(filename, "application/gzip", "backup-" + $config.filename + ".tar.gz").fail(function(e){
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
