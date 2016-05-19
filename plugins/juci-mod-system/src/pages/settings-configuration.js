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
.controller("SettingsConfigurationCtrl", function($scope, $rpc, $tr, gettext){
	$scope.sessionID = $rpc.$sid(); 
	$scope.resetPossible = 0; 
	$scope.resetPossible = 1; 
	$scope.passwordError = false;

	$rpc.$call("juci.system.conf", "run", {"method":"features"}).done(function(features){
		$scope.features = features; 
		$scope.$apply();
	}); 

	$scope.onReset = function(){
		if(confirm(gettext("This will reset your configuration to factory defaults. Do you want to continue?"))){
			$rpc.$call("juci.system", "run", {"method":"defaultreset"}).done(function(result){
				console.log("Performing reset: "+JSON.stringify(result)); 
				window.location = "/reboot.html";  
			}); 
		}
	}
	$scope.onSaveConfig = function(){
		$scope.showModal = 1; 
	}

	$scope.onRestoreConfig = function(){
		$scope.showUploadModal = 1; 
	}
	$scope.onCancelRestore = function(){
		$scope.showUploadModal = 0; 
	}
	$scope.data = {}; 
	$scope.onUploadConfig = function(){
		var upfile = document.getElementById("upload");
		if(!upfile.name || upfile.size < 1) return;
		var callId = 0;
		var fileChunkSize = 500000;
		var time = Date.now();
		if($rpc.file && $rpc.file.write){
			var fileUploadState = {
				file: upfile.files[0],
				reader: new FileReader(),
				offset: 0,
				id: ++callId,
				respwatcher: null,
			};
			console.log(fileUploadState.file);

			fileUploadState.reader.onload = function(e) {
				if(e.target.error != null) {
					console.log("error reading file " + e.target.error);
					return false;
				}
				$rpc.file.write({
					path: "/tmp/backup.tar.gz",
					data: e.target.result.split(",")[1],
					base64: true,
					append: fileUploadState.offset > 0
				}).done(function(){
					fileUploadState.id = ++callId;
					fileUploadState.offset += fileChunkSize;
					if(fileUploadState.offset < fileUploadState.file.size){
						fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
					}
					else{
						onUploadComplete(fileUploadState.file.name);
					}
				}).fail(function(e){
					fileUploadState = null;
					console.log("Error uploading file");
					console.log(e);
				});
			}
			fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
		}
	}
	function onUploadComplete(result){
		console.log("Uploaded: "+JSON.stringify(result)); 
		$rpc.$call("juci.system.conf", "run", {"method":"restore","args":JSON.stringify({
			pass: $scope.data.pass
		})}).done(function(result){
			if(result.error){
				alert(result.error); 
			} else {
				$scope.showUploadModal = 0; 
				$scope.$apply(); 
				if(confirm($tr(gettext("Configuration has been restored. You need to reboot the device for settings to take effect! Do you want to reboot now?")))){
					$rpc.$call("juci.system", "run", {"method":"reboot"}); 
					setTimeout(function(){window.location = "/reboot.html";}, 0);
				}
			}
		}).fail(function(err){
			console.error("Filed: "+JSON.stringify(err)); 
		}).always(function(){
			$scope.data = {}; 
			$scope.$apply(); 
		}); 
	}
	$scope.onAcceptModal = function(){
		if($scope.passwordError || !$rpc.juci || !$rpc.juci.system || !$rpc.file){ return; }
		if($scope.data.pass != $scope.data.pass_repeat) {
			alert($tr(gettext("Passwords do not match!"))); 
			return; 
		}
		if($scope.data.pass == ""){
			if(!confirm($tr(gettext("Are you sure you want to save backup without password?")))) return; 
		}
		$scope.showModal = 0; 
		$rpc.juci.system.run({
			"method":"create_backup",
			"args": ($scope.data.pass ? JSON.stringify({password: $scope.data.pass}) : undefined)
		}).done(function(){
			$rpc.file.read({path:"/tmp/backup.tar.gz", base64: true}).done(function(result){
				location.href = "data:application/gzip;\r\nContent-Disposition:attachment;filename=\"backup.tar.gz\","+result.data;
				$scope.data = {}; 
			}).fail(function(error){$scope.data = {};alert("error" + JSON.stringify(error)); });
		}).fail(function(error){	$scope.data = {}; alert("error" + JSON.stringify(error)); });
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
}); 
