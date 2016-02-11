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
.controller("InternetLANRoutesPage", function($scope, $uci, $network){
	$network.getNetworks().done(function(lans){
		$scope.routes = $uci.network["@route"]; 
		$scope.routes6 = $uci.network["@route6"]; 
		$scope.allNetworks = lans.filter(function(net){
			return net[".name"] != "loopback"; 
		}).map(function(net){
			return { label: net[".name"], value: net[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 

	$scope.getError = function(option){
		console.log(option);
		if(option.value == "") return false;
		if(option.error == null) return true;
		return false;
	};
	
	$scope.onAddRoute = function(){
		$uci.network.$create({
			".type": "route"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteRoute = function(route){
		if(!route) return; 
		route.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onAddRoute6 = function(){
		$uci.network.$create({
			".type": "route6"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

}); 
