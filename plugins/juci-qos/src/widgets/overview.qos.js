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
.directive("overviewWidget00QoS", function(){
	return {
		templateUrl: "widgets/overview.qos.html",
		controller: "overviewWidgetQoS",
		replace: true
	};
})
.controller("overviewWidgetQoS", function($scope, $rpc, $uci, $tr, gettext, $juciDialog, $events, $wireless, $config){
	$scope.qos = {};
	$scope.limit_selected = {};

	$uci.$sync().done(function() {
		$scope.qos = $uci.qos;
		//console.log($scope.qos);
		$scope.rate_limits = $uci.qos["@rate-limit"].map(function(limit) {
			return { value:limit.name.value, label:limit.name.value, download:limit.download.value, upload:limit.upload.value };
		});

		$scope.rate_limits.forEach(function(y) {
			if($scope.qos.wan.download.value === y.download && $scope.qos.wan.upload.value === y.upload) {
				$scope.limit_selected.value = y.label;
			}
		});

		$scope.$watch("limit_selected.value", function(x){
			if(!x) return;

			$scope.rate_limits.forEach(function(y) {
				if(y.label === x) {
					$scope.qos.wan.download.value = y.download;
					$scope.qos.wan.upload.value = y.upload;
				}
			});
		}, false);
/*
	$scope.$watch("qos.wan.download.value", function(x){
			if(!x) return;
console.log("hejsan dl bytt");
			
		}, false);

		$scope.$watch("qos.wan.upload.value", function(x){
			if(!x) return;
console.log("hejsan ul bytt");
			
		}, false);
*/
	});

	$scope.href = $config.getWidgetLink("overviewWidget00QoS");

});
