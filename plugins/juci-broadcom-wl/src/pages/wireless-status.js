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
	$uci.$sync("wireless").done(function(){
		$rpc.juci.wireless.radios().done(function(data){
			$scope.wlRadios = Object.keys(data).map(function(x){ return data[x]; }); ; 
			$scope.$apply(); 
		});
		$scope.dfs_enabled = $uci.wireless["@wifi-device"].find(function(x){ return x.dfsc.value != 0; }) != null; 
		$scope.doScan = function(){
			$scope.scanning = 1; 
			async.eachSeries($uci.wireless["@wifi-device"].filter(function(x){ return x.dfsc.value == 0; }), function(dev, next){
				console.log("Scanning on "+dev[".name"]); 
				$wireless.scan({device: dev[".name"]}).done(function(){
					setTimeout(function(){
						console.log("Getting scan results for "+dev[".name"]); 
						$wireless.getScanResults({device: dev[".name"]}).done(function(aps){
							$scope.access_points = aps;
							$scope.scanning = 0; 
							$scope.$apply(); 
						}); 
					}, 5000); 
					next(); 
				}); 
			}); 
		} 
	}); 
}); 
