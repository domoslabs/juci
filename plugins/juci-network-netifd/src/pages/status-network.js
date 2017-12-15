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
.controller("NetifdNetworkStatusPage", function ($scope, $uci, $rpc, $events) {
	//$scope.expanded = false; 
	
	$events.subscribe("network.interface", function(){
		refresh();
	});
	function refresh(){
		var _interfaces;
		async.series([
			function(next){
				$rpc.$call("network.interface", "dump").done(function(result){
					_interfaces = result.interface.filter(function(x){
						return x.interface != "loopback"; // filter out loopback. Is there any use case where we would want it? 
					}).map(function(x){
						// figure out correct default gateway
						if(x.route) x._defaultroute4 = x.route.find(function(r){ return r.target == "0.0.0.0" });
						return x; 
					}); 
					next(); 
				}); 
			} 
		], function(){
			var sections = []; 
			_interfaces.map(function(i){
				sections.push({
					name: i.interface, 
					interface: i
				}); 
			}); 
			$scope.sections = sections.filter(function(x){ return x.interface !== undefined; }).sort(function(a, b) { return a.interface.up > b.interface.up; }); 
			for(var c = 0; c < sections.length; c++){
				var sec = sections[c]; 
				if(sec.interface.up) sec.status = "ok"; 
				else if(sec.interface.pending) sec.status = "progress"; 
				else sec.status = "error"; 
			} 
			$scope.$apply(); 
		});
	}refresh(); 
}); 
