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
.controller("SettingsUpgradeCtrl", function($scope, $uci, $config, $rpc, $tr, gettext, $juciDialog, $events){
	$scope.sessionID = $rpc.$sid();
	$scope.uploadFilename = "/tmp/firmware.bin";
	$scope.usbFileName = "()"; 
	$scope.usbUpgradeAvailable = false;  
	
	$scope.current_version = $config.board.system.firmware; 
	
	$uci.$sync("system").done(function(){
		$scope.system = $uci.system; 
		$scope.$apply(); 
	}); 
	
	$rpc.system.board().done(function(info){
		$scope.board = info; 
		$scope.$apply(); 
	}); 

	function confirmKeep(){
		var deferred = $.Deferred(); 
		$juciDialog.show(null, {
			title: $tr(gettext("Do you want to keep your configuration?")),
			content: $tr(gettext("If you answer yes then your configuration will be saved before the upgrade and restored after the upgrade has completed. If you choose 'no' then all your current configuration will be reset to defaults.")),
			buttons: [
				{ label: $tr(gettext("Yes")), value: "yes", primary: true },
				{ label: $tr(gettext("No")), value: "no" },
				{ label: $tr(gettext("Abort")), value: "abort" }
			],
			on_button: function(btn, inst){
				if(btn.value == "yes"){
					inst.close();
					deferred.resolve(true);
				}
				if(btn.value == "no"){
					inst.close();
					deferred.resolve(false);
				}
				if(btn.value == "abort"){
					inst.dismiss("abort");
				}
			}
		});

		return deferred.promise(); 
	}
	
	
	$events.subscribe("sysupgrade-test", function(result){
		if(result.data && result.data.error && result.data.stdout) {
			$scope.showUpgradeStatus = 0; 
			$scope.$apply();
			$juciDialog.show(null, {
				title: $tr(gettext("Image check failed")),
				buttons: [{ label: $tr(gettext("OK")), value: "ok", primary: true }],
				on_button: function(btn, inst){
					inst.dismiss("ok");
				},
				content: ($tr(gettext("Error: ")) + result.data.stdout)
			});
			return; 
		}
		//console.log("calling ubus call /juci/system.upgrade start now");
		$scope.progress = $tr(gettext("Upgrading"));
		$scope.$apply();
		$rpc.juci.system.upgrade.run({"method":"start","args":JSON.stringify({"path": $scope.$PATH, "keep": (($scope.$KEEP)?1:0)})}).always(function(){ // this always returns true;
			$scope.showUpgradeStatus = 0; 
			$scope.$apply();
			window.location = "/reboot.html";
		});
	});
	$scope.onDismissModal = function(){
		$scope.showUpgradeStatus = false;
	};
	
	$scope.onCheckUSB = function(){
		$scope.usbUpgradeAvailable = false;
		$scope.usbCheckInProgress = 1; 
		$rpc.juci.system.upgrade.run({"method":"check","args":JSON.stringify({type: "usb"})}).done(function(response){
			if(response.usb) {
				$scope.usbUpgrade = response.usb; 
				$scope.usbUpgradeStatus = $tr(gettext("New Software Available!"));
				$scope.usbUpgradeAvailable = true;
			} else {
				$scope.usbUpgradeStatus = $tr(gettext("No upgrade has been found!")); 
				$scope.usbUpgrade = "";
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("USB upgrade check failed"))+": "+response.stderr); 
			$scope.usbCheckInProgress = 0; 
			$scope.$apply(); 
		});
	}

	$scope.onCheckOnline = function(){
		$scope.onlineUpgradeAvailable = false;
		$scope.onlineCheckInProgress = 1; 
		$rpc.juci.system.upgrade.run({"method":"check","args":JSON.stringify({type: "online"})}).done(function(response){
			if(response.online) {
				$scope.onlineUpgrade = response.online; 
				$scope.onlineUpgradeStatus = $tr(gettext("New Software Available!"));
				$scope.onlineUpgradeAvailable = true;
			} else {
				$scope.onlineUpgrade = "";
				$scope.onlineUpgradeStatus = $tr(gettext("No upgrade has been found!")); 
			}
			if(response.stderr) $scope.$emit("error", $tr(gettext("Online upgrade check failed"))+": "+response.stderr); 
			$scope.onlineCheckInProgress = 0; 
			$scope.$apply(); 
		}); 
	} 
	$scope.onUpgradeOnline = function(){
		confirmKeep().done(function(keep){
			$scope.showUpgradeStatus = 1;
			$scope.message = $tr(gettext("Downloading and verifying image..."));
			$scope.progress = $tr(gettext("Uploading"));
			$scope.$KEEP = keep;
			$scope.$PATH = $scope.uploadFilename;
			console.log("testing image: "+ $scope.uploadFilename);
			$rpc.juci.system.upgrade.run({"method":"test","args":JSON.stringify({"path":$scope.onlineUpgrade})}).fail(function(){
				$scope.showUpgradeStatus = 0;
				$scope.$apply();
			});
		}); 
	}
	
	$scope.onUpgradeUSB = function(){
		confirmKeep().done(function(keep){
			$scope.showUpgradeStatus = 1;
			$scope.message = $tr(gettext("Verifying image..."));
			$scope.progress = $tr(gettext("Verifying"));
			$scope.$KEEP = keep;
			$scope.$PATH = $scope.usbUpgrade;
			console.log("testing image: "+$scope.usbUpgrade);
			$rpc.juci.system.upgrade.run({"method":"test","args":JSON.stringify({"path":$scope.usbUpgrade})}).fail(function(){
				$scope.showUpgradeStatus = 0;
				$scope.$apply();
			});
		}); 
	}
	$scope.onStartUpgrade = function(){
		confirmKeep().done(function(keep){
			startUpload(keep);
		});
	}
	
	$scope.imageSelected = false;
	$scope.onFileSelected = function(){
		var dom = document.getElementById("imageFileSelector");
		if(dom.files && dom.files.length > 0 ){
			$scope.imageSelected = true;
		}else{
			$scope.imageSelected = false;
		}
		$scope.$apply();
	};

	$scope.onCheckUSB(); 
	$scope.onCheckOnline(); 
	
	function startUpload(keep){
		$scope.showUpgradeStatus = 1; 
		$scope.message = "Uploading..."; 
		$scope.progress = 'uploading'; 
		$("#postiframe").bind("load", function(){
			var json = $(this).contents().text(); 
			try {
				$scope.$KEEP = keep;
				$rpc.juci.system.upgrade.run({"method":"test","args":JSON.stringify({"path":$scope.uploadFilename})}).fail(function(){
					$scope.showUpgradeStatus = 0;
					$scope.$apply();
				});
			} catch(e){
				$scope.error = $tr(gettext("The server returned an error"))+" ("+JSON.stringify(json)+")";
				$scope.message = $tr(gettext("Upload completed!"))
				$scope.$apply();
			}
			
			$(this).unbind("load"); 
		}); 
		$("form[name='uploadForm']").submit();
	}
}); 
