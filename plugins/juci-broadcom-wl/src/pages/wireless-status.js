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
.controller("wirelessStatusPage", function($scope, $uci, $wireless, gettext, $rpc){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = !$scope.reverse;
	}
	$scope.radioToScan = {};
	$uci.$sync("wireless").done(function(){
		$rpc.juci.wireless.radios().done(function(data){
			$scope.wlRadios = Object.keys(data).map(function(x){ return data[x]; });
			$scope.scanableRadios = $scope.wlRadios.filter(function(radio){
				return parseInt(radio.current_channel) < 52;
			}).map(function(radio){
				return { label: radio.frequency, value: radio.device };
			});
			$scope.dfs_enabled = ($scope.wlRadios.length != $scope.scanableRadios.length);
			$scope.radioToScan.value = $scope.scanableRadios[0].value || null;
			console.log($scope.radioToScan.value);
			$scope.$apply(); 
		});
		$scope.doScan = function(){
			if($scope.radioToScan.value == null)return;
			$scope.scanning = 1; 
			console.log("Scanning on "+$scope.radioToScan.value); 
			$wireless.scan({device: $scope.radioToScan.value}).done(function(){
				setTimeout(function(){
					console.log("Getting scan results for "+$scope.radioToScan.value); 
					$wireless.getScanResults({device: $scope.radioToScan.value }).done(function(aps){
						$scope.access_points = aps;
						$scope.scanning = 0; 
						$scope.$apply(); 
					}); 
				}, 5000); 
			}); 
		} 
	}); 
}); 
