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
.controller("wirelessClientsPage", function($scope, $network, $rpc){
	JUCI.interval.repeat("wireless-clients-refresh", 5000, function(done){
		$rpc.juci.wireless.clients().done(function(result){
			if(!result || !result.clients) return; 
			$network.getConnectedClients().done(function(clients){
				$scope.clients = clients.filter(function(cl){
					var wcl = result.clients.find(function(wcl){ return wcl.macaddr == cl.macaddr });
					if(!wcl) return false; 
					// replace the device with actual wireless device (instead of some generic br-lan)..
					cl.device = wcl.device; 
					return true; 
				}); 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
}); 
