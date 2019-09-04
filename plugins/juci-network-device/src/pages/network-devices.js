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
.controller("NetworkDevicesPageCtrl", function($scope, $uci, $rpc, $network, $config){
	$scope.config = $config;

	$scope.order = function(field){
		$scope.predicate = field;
		$scope.reverse = !$scope.reverse;
	}

	$network.getAdapters().done(function(adapters){
		$scope.adapters = adapters.filter(function(a){
			return (a.up || a.type === "wireless" ) && a.name;
		}).map(function(a){
			if(a.type === "wireless") a._icon = "juci juci-wifi";
			if(a.type === "eth-port") a._icon = "juci juci-ethernet";
			if(a.type === "eth-bridge") a._icon = "juci juci-bridge";
			if(a.type === "ptm-device") a._icon = "juci juci-vdsl";
			if(a.type === "atm-device") a._icon = "juci juci-adsl";
			if(a.type === "vlan") a._icon = "juci juci-vlan";
			if(!a.statistics || !a.statistics.tx_bytes)
				a["__tx_bytes"] = "0 B";
			else if(a.statistics.tx_bytes > 1024*1024)
				a["__tx_bytes"] = Math.round((a.statistics.tx_bytes/1024/1024)*10)/10 + " MB";
			else if(a.statistics.tx_bytes > 1024)
				a["__tx_bytes"] = Math.round((a.statistics.tx_bytes/1024)*10)/10 + " kB";
			else
				a["__tx_bytes"] = a.statistics.tx_bytes + " B";
			if(!a.statistics || !a.statistics.rx_bytes)
				a["__rx_bytes"] = "0 B";
			else if(a.statistics.rx_bytes > 1024*1024)
				a["__rx_bytes"] = Math.round((a.statistics.rx_bytes/1024/1024)*10)/10 + " MB";
			else if(a.statistics.rx_bytes > 1024)
				a["__rx_bytes"] = Math.round((a.statistics.rx_bytes/1024)*10)/10 + " kB";
			else
				a["__rx_bytes"] = a.statistics.rx_bytes + " B";
			return a;
		});
		$scope.$apply();
	});
});
