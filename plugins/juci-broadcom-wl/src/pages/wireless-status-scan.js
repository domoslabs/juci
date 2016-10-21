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
.controller("wirelessStatusScanPage", function($scope, $uci, $wireless, $rpc){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = !$scope.reverse;
	}
	$scope.radioToScan = {};
	$uci.$sync("wireless").done(function(){
		$rpc.$call("router.wireless", "radios").done(function(data){
			$scope.wlRadios = data;
			$scope.wlRadiosList = Object.keys(data).map(function(x){ data[x].device = x; return data[x]; });
			$scope.scanableRadios = $scope.wlRadiosList.filter(function(radio){
				return parseInt(radio.channel) < 52;
			}).map(function(radio){
				return { label: radio.frequency, value: radio.device };
			});
			$scope.dfs_enabled = ($scope.wlRadiosList.length != $scope.scanableRadios.length);
			if($scope.scanableRadios.length > 0){
				$scope.radioToScan.value = $scope.scanableRadios[0].value;
			}
			$scope.$apply();
		});
		$scope.doScan = function(){
			if($scope.radioToScan.value == null)return;
			async.series([
				function(next){
					$rpc.$call("router.wireless", "radios").done(function(data){
						$scope.radioIsUp = data[$scope.radioToScan.value].isup;
						$scope.freq = data[$scope.radioToScan.value].frequency;
						$scope.$apply();
						next();
					});
				},
				function(){
					if(!$scope.radioIsUp){ alert("Please enable radio on "+$scope.freq+" interface to scan it"); return; }
					$scope.scanning = 1; 
					$scope.$apply();
					console.log("Scanning on "+$scope.radioToScan.value); 
					$wireless.scan({radio: $scope.radioToScan.value}).done(function(){
						setTimeout(function(){
							console.log("Getting scan results for "+$scope.radioToScan.value); 
							$wireless.getScanResults({radio: $scope.radioToScan.value }).done(function(aps){
								$scope.access_points = aps;
								$scope.scanning = 0; 
								$scope.$apply(); 
							}); 
						}, 5000); 
					}); 
				}
			]);
		} 
	}); 
}); 
