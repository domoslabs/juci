/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
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
.directive("provisioningExportDialog", function(){
	return {
		templateUrl: "/widgets/provisioning-export-dialog.html",
		scope: {
			model: "=ngModel"
		},
		require: "^ngModel",
		controller: "provisionExportDialogCtrl"
	};
}).controller("provisionExportDialogCtrl", function($scope){
	$scope.showPassword = false;
	$scope.model.value = "";
	$scope.model.doubble = "";
	$scope.model.show_error = false;
	$scope.togglePasswd = function(){
		$scope.showPassword = !$scope.showPassword;
	};
	$scope.update = function(){
		if($scope.model.doubble == "") return;
		if($scope.model.doubble == $scope.model.value) return 'has-success';
		return 'has-error';
	}
});
