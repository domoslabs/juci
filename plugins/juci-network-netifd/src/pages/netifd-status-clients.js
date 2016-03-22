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
.controller("NetifdStatusClientsPage", function($scope, $network, $firewall, $rpc){
	$network.getConnectedClients().done(function(clients){
		$scope.clients = []; 
		// TODO: this is duplicate of what is in overview-net widget. We need a better way to list lan clients without treating lan as special network. 
		// TODO: this is not static. Need to find a way to more reliably separate lan and wan so we can list lan clients from all lans without including wans. 
		$firewall.getLanZones().done(function(lan_zone){
			if(!lan_zone) { console.error("no lan zone found in firewall config!"); return; }

			$rpc.network.interface.dump().done(function(stats){
				var interfaces = stats.interface; 
				lan_zone.map(function(zone){
					zone.network.value.map(function(net){
						var iface = interfaces.find(function(x){ return x.interface == net }); 
						if(!iface) return; 
					
						clients.filter(function(cl) { return cl.device == iface.l3_device; })
						.map(function(cl){
							cl._display_html = "<"+cl._display_widget + " ng-model='client'/>"; 
							$scope.clients.push(cl);  
						}); 
					});
				});
				$scope.$apply(); 
			}); 
		}); 

	}); 
}); 
