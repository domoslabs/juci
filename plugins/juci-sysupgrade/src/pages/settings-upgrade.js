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
.controller("SettingsUpgradeCtrl", function($scope, $uci, $config, $rpc, $tr, gettext, $juciDialog, $events, $file){
	$scope.sessionID = $rpc.$sid();
	$scope.usbFileName = "()";
	$scope.data = { upUrl: ""};
	$scope.usbUpgradeAvailable = false;
	$scope.upfile = {};
	var uploadFilename = "/tmp/juci/firmware.bin";

	$scope.current_version = $config.get("board.system.firmware");

	$uci.$sync("system").done(function(){
		$scope.system = $uci.system;
		$scope.$apply();
	});

	$rpc.$call("system", "board").done(function(info){
		$scope.board = info;
		$scope.$apply();
	});

	$rpc.$call("router.system", "info").done(function(data){
		$scope.hasUsb = data.specs.usb;
		$scope.$apply();
	});

	function confirmKeep(){
		var deferred = $.Deferred();
		$juciDialog.show(null, {
			title: $tr(gettext("Do you want to keep your configuration?")),
			content: $tr(gettext("If you choose yes then your configuration will be saved and restored after the upgrade has completed.")) + "<br />" +
				$tr(gettext("If you choose 'soft' then important user settings will be saved and restored after the upgrade has completed.")) + "<br />" +
				$tr(gettext("If you choose 'no' then all your current configuration will be reset to defaults.")),
			buttons: [
				{ label: $tr(gettext("Yes")), value: "yes", primary: true },
				{ label: $tr(gettext("Soft")), value: "soft" },
				{ label: $tr(gettext("No")), value: "no" },
				{ label: $tr(gettext("Abort")), value: "abort" }
			],
			on_button: function(btn, inst){
				if(btn.value == "yes"){
					inst.close();
					deferred.resolve("yes");
				}
				if(btn.value == "no"){
					inst.close();
					deferred.resolve("no");
				}
				if(btn.value == "soft"){
					inst.close();
					deferred.resolve("soft");
				}
				if(btn.value == "abort"){
					inst.dismiss("abort");
					deferred.reject("abort");
				}
			}
		});

		return deferred.promise();
	}

	$events.subscribe("sysupgrade", function(result){
		if(!result || !result.data || !result.data.status) return;
		if(result.data && result.data.status && result.data.status == "failed") {
			$scope.showUpgradeStatus = false;
			$scope.$apply();
			$juciDialog.show(null, {
				title: $tr(gettext("Image check failed")),
				buttons: [{ label: $tr(gettext("OK")), value: "ok", primary: true }],
				on_button: function(btn, inst){
					inst.dismiss("ok");
				},
				content: ($tr(gettext("Error: ")) + (result.data.test || $tr(gettext("unknown test"))) + ": " + result.data.status)
			});
			return;
		}
		window.location = "/reboot.html";
	});
	$scope.onDismissModal = function(){
		$scope.showUpgradeStatus = false;
	};

	$scope.onCheckUSB = function(){
		var ufwpath;
		$scope.usbUpgradeAvailable = false;
		$scope.usbCheckInProgress = true;
		$rpc.$call("juci.sysupgrade", "check", {"type": "usb"}).done(function(response){
			if(response.usb) {
				$scope.usbUpgrade = response.usb;
				ufwpath = response.usb.split("/");
				$scope.usbUpgradeStatus = $tr(gettext(ufwpath[ufwpath.length-1]));
				$scope.usbUpgradeAvailable = true;
			} else {
				$scope.usbUpgradeStatus = $tr(gettext("No upgrade has been found!"));
				$scope.usbUpgrade = "";
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("USB upgrade check failed"))+": "+response.stderr);
			$scope.usbCheckInProgress = false;
			$scope.$apply();
		}).fail(function(e){
			console.log(e);
			$scope.usbCheckInProgress = false;
			$scope.$apply();
		});
	};

	($scope.onCheckOnline = function(){
		$scope.onlineUpgradeAvailable = false;
		$scope.onlineCheckInProgress = true;
		$rpc.$call("juci.sysupgrade", "check", {"type": "online"}).done(function(response){
			if(response.online) {
				$scope.onlineUpgrade = response.online;
				$scope.onlineUpgradeStatus = $tr(gettext("New Software Available!"));
				$scope.onlineUpgradeAvailable = true;
			} else {
				$scope.onlineUpgrade = "";
				$scope.onlineUpgradeStatus = $tr(gettext("No upgrade has been found!"));
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("Online upgrade check failed"))+": "+response.stderr);
			$scope.onlineCheckInProgress = false;
			$scope.$apply();
		}).fail(function(e){
			console.log(e);
			$scope.onlineCheckInProgress = false;
			$scope.$apply();
		});
	})();
	$scope.onUpgradeOnline = function(){
		confirmKeep().done(function(keep){
			$scope.showUpgradeStatus = true;
			$scope.message = $tr(gettext("Downloading and verifying image..."));
			$scope.progress = $tr(gettext("Uploading"));
			console.log("testing image: "+ uploadFilename);
			$rpc.$call("juci.sysupgrade", "start", {"path":$scope.onlineUpgrade, "keep":keep});
		});
	}

	$scope.onUpgradeUSB = function(){
		confirmKeep().done(function(keep){
			$scope.showUpgradeStatus = true;
			$scope.message = $tr(gettext("Verifying image..."));
			$scope.progress = $tr(gettext("Verifying"));
			console.log("testing image: "+$scope.usbUpgrade);
			$rpc.$call("juci.sysupgrade", "start", {"path":$scope.usbUpgrade, "keep":keep});
		});
	}
	$scope.onStartUpgrade = function(){
		if($scope.showUpgradeStatus)
			return;
		if(!($scope.upfile.files && $scope.upfile.files[0] && $scope.upfile.files[0].name) && !$scope.data.upUrl)
			return;
		if($scope.data.upUrl){
			confirmKeep().done(function(keep){
				$scope.showUpgradeStatus = true;
				$scope.message = $tr(gettext("Downloading and verifying image..."));
				$scope.progress = $tr(gettext("Uploading"));
				console.log("testing image: "+$scope.data.upUrl);
				$rpc.$call("juci.sysupgrade", "start", {"path":$scope.data.upUrl, "keep":keep});
				$scope.data.upUrl = "";
				$scope.$apply();
			});
		}else{
			confirmKeep().done(function(keep){
				startUpload(keep);
			});
		}
	}

	$scope.fileChanged = function(){
		$scope.upfile = document.getElementById("imageFileSelector");
		$scope.$apply();
	}

	function startUpload(keep){
		var upfile = $scope.upfile;
		if(!upfile.name || upfile.size < 1) return;
		$file.uploadFile(uploadFilename, upfile.files[0], function(progress, total){
			$scope.progress_byte = progress;
			$scope.progress_total = total;
			$scope.$apply();
		}).done(function(){
			$scope.progress_byte = $scope.progress_total;
			$scope.$apply();
			$rpc.$call("juci.sysupgrade", "start", {"path":uploadFilename, "keep":keep});
		}).fail(function(e){
			$scope.error =  $tr(gettext("The server returned an error"))+" ("+JSON.stringify(e)+")";
			$scope.$apply();
		});
		$scope.progress_byte = 0;
		$scope.showUpgradeStatus = true;
		$scope.error = "";
	}
});
