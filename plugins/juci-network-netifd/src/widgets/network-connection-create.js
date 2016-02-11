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
.factory("networkConnectionCreate", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'widgets/network-connection-create.html',
				controller: 'networkConnectionCreateModal',
				resolve: {
					
				}
			});

			modalInstance.result.then(function (data) {
				setTimeout(function(){ // do this because the callback is called during $apply() cycle
					def.resolve(data); 
				}, 0); 
			}, function () {
				
			});
			return def.promise(); 
		}
	}; 
})
.controller("networkConnectionCreateModal", function($scope, $modalInstance, gettext){
	$scope.data = {}; 
	$scope.interfaceTypes = [
		{ label: "Standalone", value: "" },
		{ label: "AnyWAN", value: "anywan"}, 
		{ label: "Bridge", value: "bridge"}
	]; 
	$scope.ok = function () {
		if(!$scope.data.name) {
			alert(gettext("You need to specify both name and type!")); 
			return; 
		}
		$modalInstance.close($scope.data);
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})
