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
.controller("InternetLayer2", function($scope, $uci, $rpc, $ethernet, $network, $config){
	$scope.config = $config; 

	$scope.order = function(field){
		$scope.predicate = field; 
		$scope.reverse = !$scope.reverse; 
	}

	$ethernet.getAdapters().done(function(adapters){
		$scope.adapters = adapters.filter(function(a){
			return (!a.flags || !a.flags.match("NOARP")); 
		}).map(function(a){
			var type = "unknown"; 
			if(["eth", "eth-bridge", "eth-port", "vlan", "wireless", "vdsl", "adsl"].indexOf(a.type) != -1){ 
				type = a.type; 
			} 
			a._icon = type+((a.state == "DOWN")?"_disabled":""); 
			return a; 
		}); 
		$scope.$apply(); 
	}); 
}); 
