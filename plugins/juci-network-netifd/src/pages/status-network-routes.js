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
.controller("StatusNetworkRoutes", function($scope, $rpc){
	if(!$rpc.juci || !$rpc.juci.network || !$rpc.juci.network.status)return;
	$rpc.juci.network.status.run({"method":"arp"}).done(function(arp_table){
		$scope.arp_table = arp_table.clients; 
		$rpc.juci.network.status.run({"method":"ipv4routes"}).done(function(ipv4_routes){
			$scope.ipv4_routes = ipv4_routes.routes; 
			$rpc.juci.network.status.run({"method":"ipv6routes"}).done(function(ipv6_routes){
				$scope.ipv6_routes = ipv6_routes.routes; 
				$scope.$apply(); 
			}); 
		}); 
	}); 
	$rpc.juci.network.status.run({"method":"ipv6neigh"}).done(function(result){
		$scope.neighbors = result.neighbors; 	
		$scope.$apply(); 
	}); 
}); 
