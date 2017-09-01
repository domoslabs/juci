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
.controller("SettingsPasswordCtrl", function($scope, $rpc, $password, $tr, gettext, $uci){
	$scope.model = {
		username: $rpc.$session.data.username,
	};
	
	$uci.$sync("passwords").done(function(){
		$scope.allUsers = $uci.passwords["@usertype"].map(function(x){
			return { label: x[".name"], value: x[".name"] };
		});
		$scope.$apply();
	});

	$scope.onChangePasswordClick = function(){
		$password.change(true, $scope.model.username);
	}

	$scope.onResetPasswordClick = function(){
		$uci.passwords[$scope.model.username].reset.value = 1;
	}

});

