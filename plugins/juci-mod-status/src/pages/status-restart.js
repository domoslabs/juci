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
.controller("StatusRestartPageCtrl", function($scope, $rpc, $juciDialog, $tr, gettext){
	$scope.onRestart = function(){
		$juciDialog.show(null, {
			title: $tr(gettext("Reboot")),
			content: $tr(gettext("Are you sure you want to reboot?")),
			on_button: function(btn, inst){
				if(btn.value == "yes"){
					window.location = "/reboot.html";
					$rpc.juci.system.reboot().done(function(){
						inst.close();
					});
				}
				inst.close();
			},
			buttons: [
				{ label: $tr(gettext("Yes")), value: "yes", primary: true },
				{ label: $tr(gettext("No")), value: "no" }
			]
		});

		/*$rpc.juci.system.reboot().done(function(){
			console.log("Restarting the system..."); 
		}); */
	}
	
	function waitUntilDown(){
		var deferred = $.Deferred(); 
		var rpc = false; 
		var interval = setInterval(function(){
			if(!rpc){
				rpc = true; 
				$rpc.session.access().done(function(){
					
				}).fail(function(){
					clearInterval(interval); 
					deferred.resolve(); 
				}).always(function(){
					rpc = false; 
				}); 
			}
		}, 1000); 
		return deferred.promise(); 
	}
	$scope.onConfirmRestart = function(){
		$scope.showRestartProgress = 1; 
		$scope.showConfirmation = 0; 
		$scope.progress = 0; 
		$rpc.juci.system.reboot().done(function(){
			var rpc = true; 
			$scope.message = "Waiting for reboot..."; 
			$scope.$apply(); 
			setInterval(function(){
				$scope.progress++; 
				$scope.$apply(); 
				if(!rpc){
					rpc = true; 
					$rpc.session.access().done(function(){
						// it will not succeed anymore because box is rebooting
					}).fail(function(result){
						if(result.code && result.code == -32002) { // access denied error. We will get it when it boots up again. 
							$scope.showConfirmation = 0; 
							$scope.$apply(); 
							window.location.reload(); 
						}
					}).always(function(){
						rpc = false; 
					}); 
				}
			}, 1000); 
			
			waitUntilDown().done(function(){
				$scope.message = "Host is rebooting..."; 
				$scope.$apply(); 
				rpc = false; 
			}); 
			console.log("Restarting the system..."); 
		});
	}
	$scope.onCancelRestart = function(){
		$scope.showConfirmation = 0; 
	}
}); 
