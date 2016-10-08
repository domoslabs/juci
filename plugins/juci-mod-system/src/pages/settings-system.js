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
.controller("SettingsSystemGeneral", function($scope, $rpc, $uci, $tr, gettext, $config){
	var date;
	async.series([
		function(next){
			$uci.$sync("system").done(function(){
				if($uci.system["@system"] && $uci.system["@system"].length)
					$scope.system = $uci.system["@system"][0]; 
				next(); 
			}); 
		}, 
		function(next){
			$rpc.$call("system", "board").done(function(values){
				$scope.boardinfo = values; 
			}).always(function(){next();}); 
		}, 
		function(next){
			$rpc.$call("juci.system", "zonelist", {}).done(function(result){
				if(result && result.zones){
					$scope.timezones = result.zones; 
					$scope.allTimeZones = Object.keys(result.zones).sort().map(function(k){
						return { label: k, value: k.trim() }; 
					}); 
					$scope.$apply();
				}
				next(); 
			}); 
		},
		function(next){
			$rpc.$call("router.system", "info").done(function(res){
				date = new Date(res.system.localtime * 1000);
			}).always(function(){next();});
		}
	], function(){
		JUCI.interval.repeat("system_update_time", 1000, function(done){
			if(!date){ done(); return;}
			date.setSeconds(date.getSeconds() + 1);
			$scope.localtime = date.toLocaleString();
			$scope.$apply();
			done();
		});
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
	
	$scope.$watch("system.zonename.value", function(value){
		if(!value || !$scope.timezones) return; 
		$scope.system.timezone.value = $scope.timezones[value]; 
	}); 

});

