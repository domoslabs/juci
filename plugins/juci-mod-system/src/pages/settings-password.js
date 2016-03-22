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
.controller("SettingsPasswordCtrl", function($scope, $rpc, $tr, gettext){
	$scope.showPassword = 0; 
	$scope.showModal = 0; 
	$scope.username = $rpc.$session.data.username; 
	$scope.modal = {
		old_password: "", 
		password: "", 
		password2: ""
	}; 
	$scope.passwordStrength = 1; 
	
	$rpc.juci.system.user.listusers({ sid: $rpc.$sid() }).done(function(result){
		$scope.allUsers = result.users.map(function(x){
			return { label: x, value: x }; 
		}); 
		$scope.$apply(); 
	}); 

	function measureStrength(p) {
		var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
		var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
		var enoughRegex = new RegExp("(?=.{4,}).*", "g");

		if(strongRegex.test(p)) return 3; 
		if(mediumRegex.test(p)) return 2; 
		if(enoughRegex.test(p)) return 1; 
		return 0; 
	}
	
	$scope.$watch("modal", function(){
		$scope.passwordStrength = measureStrength($scope.modal.password); 
	}, true); 
	
	var username = $scope.modal.username = $rpc.$session.data.username; 
	$scope.$watch("modal.username", function(value){
		if(value == undefined) return; 
		username = value; 
	}); 

	$scope.onChangePasswordClick = function(){
		$scope.modal = {}; 
		$scope.showModal = 1; 
	}

	$scope.onAcceptModal = function(){
		$scope.error = ""; 
		if($scope.modal.password != $scope.modal.password2) alert($tr(gettext("Passwords do not match!"))); 
		else {
			// TODO: change to correct username
			$rpc.juci.system.user.setpassword({sid: $rpc.$sid(), username: username, password: $scope.modal.password, oldpassword: $scope.modal.old_password}).done(function(data){
				if(data.error){
					alert(data.error); 
				} else {
					$scope.showModal = 0; 
					$scope.$apply(); 
				}
				//$rpc.$logout().done(function(){
				//	window.location.reload(); 
				//}); 
			}).fail(function(){
				$scope.error = gettext("Was unable to set password. Please make sure you have entered correct current password!"); 
				$scope.$apply(); 
			}); 
		}
	}
	$scope.onDismissModal = function(){
		$scope.showModal = 0; 
	}
}); 

