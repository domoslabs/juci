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
.controller("wirelessFilteringPage", function($scope, $uci){
	window.uci = $uci; 
	$scope.uci = $uci; 
	$uci.$sync(["wireless", "hosts"]).done(function(){
		$scope.interfaces = $uci.wireless['@wifi-iface'];
		
		// TODO: ================ this is a duplicate. It should be put elsewhere!
		$scope.devices = $uci.wireless["@wifi-device"].map(function(x){
			// TODO: this should be a uci "displayname" or something
			if(x.band.value == "a") x[".label"] = "5GHz"; 
			else if(x.band.value == "b") x[".label"] = "2.4GHz"; 
			return { label: x[".label"], value: x[".name"] };
		}); 
		$uci.wireless["@wifi-iface"].map(function(x){
			var dev = $uci.wireless[x.device.value]; 
			if(dev)
				x[".frequency"] = dev[".label"]; 
		});  
		// ========================
		
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
}); 
