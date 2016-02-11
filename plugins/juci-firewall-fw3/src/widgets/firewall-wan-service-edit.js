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
.directive("firewallWanServiceEdit", function(){
	return {
		scope: {
			service: "=ngModel"
		}, 
		controller: "firewallWanServiceEdit", 
		templateUrl: "/widgets/firewall-wan-service-edit.html"
	}; 
})
.controller("firewallWanServiceEdit", function($scope, $uci, $firewall){
	$scope.onChangeState = function(){ 
		var service = $scope.service; 
		if(!service.$rule || !service.$rule[".name"]){
			$uci.firewall.$create({
				".type": "rule", 
				"name": "Allow connection to "+service.name+" port "+service.listen_port+" from wan interface", 
				"src": "wan", 
				"proto": service.proto, 
				"dest_port": service.listen_port, 
				"target": "ACCEPT"
			}).done(function(rule){
				service.$rule = rule; 
				$scope.$apply(); 
			}); 
		}
	}
}); 
