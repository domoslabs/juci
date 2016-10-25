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
	$uci.$sync("wireless").done(function(){
		$rpc.$call("router.wireless", "radios").done(function(data){
			$scope.wlRadios = data;
			$scope.scanableRadios = Object.keys(data).map(function(x){
				if(parseInt(data[x].channel) >= 52){
					$scope.dfs_enabled = true;
					return;
				}
				return { label: data[x].frequency, value: x };
			}).filter(function(x){return x;});
			if($scope.scanableRadios.length > 0){
				$scope.radioToScan = $scope.scanableRadios[0].value;
			}
			$scope.$apply();
		});
		$scope.doScan = function(){
			if($scope.radioToScan == null)return;
			async.series([
				function(next){
					$rpc.$call("router.wireless", "radios").done(function(data){
						$scope.radioIsUp = data[$scope.radioToScan].isup;
						$scope.freq = data[$scope.radioToScan].frequency;
						$scope.$apply();
						next();
					});
				},
				function(){
					if(!$scope.radioIsUp){ alert("Please enable radio on "+$scope.freq+" interface to scan it"); return; }
					$scope.scanning = 1;
					$scope.$apply();
					$wireless.scan({radio: $scope.radioToScan}).done(function(){
						setTimeout(function(){
							$wireless.getScanResults({radio: $scope.radioToScan}).done(function(aps){
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
