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
		if($scope.predicate = pred)
			$scope.reverse = !$scope.reverse;
		else
			$scope.predicate = pred;
		console.log($scope.predicate);
		console.log($scope.reverse);
	}
	$scope.reverse = false;
	$scope.predicate = "ssid";
	$scope.radioToScan = {value:null};
	$uci.$sync("wireless").done(function(){
		function update(){
			$rpc.$call("router.wireless", "radios").done(function(data){
				$scope.wlRadios = data;
				$scope.scanableRadios = Object.keys(data).map(function(x){
					if(parseInt(data[x].channel) >= 52){
						$scope.dfs_enabled = true;
						return;
					}
					if(!data[x].isup) return;
					return { label: data[x].frequency, value: x };
				}).filter(function(x){return x;});
				if($scope.radioToScan.value === null && $scope.scanableRadios.length > 0){
					$scope.radioToScan.value = $scope.scanableRadios[0].value;
				}
				if(!$scope.scanableRadios.find(function(r){ return r.value === $scope.radioToScan.value;})){
					$scope.radioToScan.value = null;
				}
				$scope.$apply();
			});
		}
		JUCI.interval.repeat("update-wlradio-data-scan", 5000, function(next){update() ;next();});
		$scope.doScan = function(){
			if($scope.radioToScan.value == null)return;
			var radio = $scope.wlRadios[$scope.radioToScan.value];
			if(!radio) return;
			if(!radio.isup){
				alert("Please enable radio on "+radio.frequency+" interface to scan it");
				return;
			}
			$scope.scanning = 1;
			$wireless.scan({radio: $scope.radioToScan.value}).done(function(){
				setTimeout(function(){
					$wireless.getScanResults({radio: $scope.radioToScan.value}).done(function(aps){
						$scope.access_points = aps.filter(function(ap){
							return ap.ssid;// && ap.snr > -10 && ap.snr < 110;
						});
					}).fail(function(e){
						console.log(e);
					}).always(function(){
						$scope.scanning = 0;
						$scope.$apply();
					});
				}, 4000);
			}).fail(function(e){
				console.log(e);
			});
		}
		$scope.onSsidSelected = function(ap){
			$scope.ssidToShow = ap;
		}
	});
});
