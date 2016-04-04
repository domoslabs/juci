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
.factory("networkHostPicker", function($modal, $network){
	return {
		show: function(opts){
			var def = $.Deferred(); 
			if(!opts) opts = {}; 
			$network.getConnectedClients().done(function(clients){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'widgets/network-host-picker.html',
					controller: 'networkHostPickerModal',
					resolve: {
						hosts: function () {
							return clients.map(function(cl){
								return { label: cl.ipaddr, value: cl }; 
							}); 
						}
					}
				});

				modalInstance.result.then(function (data) {
					setTimeout(function(){ // do this because the callback is called during $apply() cycle
						def.resolve(data); 
					}, 0); 
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}); 
			return def.promise(); 
		}
	}; 
})
.controller("networkHostPickerModal", function($scope, $modalInstance, $wireless, hosts, gettext){
	$scope.hosts = hosts; 
	$scope.data = {}; 
  $scope.ok = function () {
		if(!$scope.data.selected) {
			alert(gettext("You need to select a host!")); 
			return; 
		}
		$modalInstance.close($scope.data.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
