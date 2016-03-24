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
.controller("wirelessClientsPage", function($scope, $rpc){
	$scope.lines = [
		{ title: "Hostname", field: "hostname" }, 
		{ title: "IPv4 Address", field: "ipaddr" }, 
		{ title: "IPv6 Address", field: "ip6addr" }, 
		{ title: "Frequency", field: "frequency" },
		{ title: "MAC-Address", field: "macaddr" }
	]; 
	$rpc.router.stas().done(function(clients){
		$rpc.router.clients6().done(function(cl6){
			$scope.clients = Object.keys(clients).map(function(c){return clients[c];}).map(function(client){
				Object.keys(cl6).map(function(c6){return cl6[c6];}).map(function(client6){
					if(client.macaddr === client6.macaddr){
						client.ip6addr = client6.ip6addr;
					}
				});
				return client;
			});
			$scope.$apply();
		});
	});
}); 
