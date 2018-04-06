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

		if($rpc.$has("router.dsl", "stats") && $scope.qos.wan.download.value === "" && $scope.qos.wan.upload.value === ""){
			$rpc.$call("router.dsl", "stats").done(function(stats){
				if(stats && stats.dslstats
					&& stats.dslstats.bearers
					&& stats.dslstats.bearers.length
					&& stats.dslstats.bearers[0].rate_up
					&& stats.dslstats.bearers[0].rate_down){
					$scope.qos.wan.download.value = stats.dslstats.bearers[0].rate_down * 0.99;
					$scope.qos.wan.upload.value = stats.dslstats.bearers[0].rate_up * 0.99;
					$scope.$apply();
				}
			}).fail(function(e){
				console.log(e);
			});
		}
	});

	$scope.href = $config.getWidgetLink("overviewWidget00QoS");

});
