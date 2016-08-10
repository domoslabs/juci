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
.controller("InternetLayer2", function($scope, $uci, $rpc, $ethernet, $network, $config){
	$scope.config = $config; 

	$scope.order = function(field){
		$scope.predicate = field; 
		$scope.reverse = !$scope.reverse; 
	}

	$ethernet.getAdapters().done(function(adapters){
		$scope.adapters = adapters.map(function(a){
			if(a.device.match(/^wl.*/)) a._icon = "juci juci-wifi";
			if(a.device.match(/^eth.*/)) a._icon = "juci juci-ethernet";
			if(a.device.match(/^br.*/)) a._icon = "juci juci-bridge";
			if(a.device.match(/^ptm.*/)) a._icon = "juci juci-VDSL";
			if(a.device.match(/^atm.*/)) a._icon = "juci juci-ADSL";
			return a; 
		}); 
		$scope.$apply(); 
	}); 
}); 
