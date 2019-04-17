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
.directive("overviewWidget91QoS", function(){
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
		if($rpc.$has("dsl", "status") && $scope.qos.wan.download.value === "" && $scope.qos.wan.upload.value === ""){
			$rpc.$call("dsl", "status").done(function(stats){
				if(stats && stats.line && stats.line.length > 0
						&& stats.line[0].channel
						&& stats.line[0].channel.length
						&& stats.line[0].channel[0].actndr
						&& stats.line[0].channel[0].actndr.us
						&& stats.line[0].channel[0].actndr.ds){
					$scope.qos.wan.download.value = stats.line[0].channel[0].actndr.ds * 0.99;
					$scope.qos.wan.upload.value = stats.line[0].channel[0].actndr.us * 0.99;
					$scope.$apply();
				}
			}).fail(function(e){
				console.log(e);
			});
		}
	});

	$scope.href = $config.getWidgetLink("overviewWidget91QoS");

});
