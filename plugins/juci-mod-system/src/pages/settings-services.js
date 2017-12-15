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
.controller("ServicesStatusPage", function($scope, $rpc){
	JUCI.interval.repeat("juci-services-page", 5000, function(done){
		$rpc.$call("juci.service", "list", {}).done(function(result){
			$scope.services = result.services; 
			$scope.services.map(function(service){
				service.reload = false;
				if(!service.start){
					service.start = 9999;
				}
			}); 
			$scope.services.sort(function(a,b){
				return a.start - b.start;
			});
			$scope.$apply();
			done(); 
		});
	}); 

	$scope.onServiceEnable = function(service){
		if(service.enabled){
			$rpc.$call("juci.service", "disable", service).done(function(){
				console.log("service: " + service.name + " is disabled");
				$scope.$apply();
			});	
		} else {
			$rpc.$call("juci.service", "enable", service).done(function(){
				console.log("service: " + service.name + " is enabled");
				$scope.$apply();
			});
		}
	}
	
	$scope.onServiceReload = function(service){
		service.reload = true;
		$rpc.$call("juci.service", "reload", service).done(function(){
			console.log("service: " + service.name + " is reloded");
			service.reload = false;
			$scope.$apply();
		});
	}

	$scope.onServiceToggle = function(service){
		if(service.running){
			$rpc.$call("juci.service", "stop",service).done(function(){
				service.running = true;
				console.log("service: " + service.name + " is stoped");
				$scope.$apply();
			});	
		} else {
			$rpc.$call("juci.service", "start", service).done(function(){
				service.running = false;
				console.log("service: " + service.name + " is started");
				$scope.$apply();
			});
		}
	}
}); 
