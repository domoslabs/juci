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
.directive("ddnsNetworkSettingsEdit", function(){
	return {
		scope: {
			ddns: "=ngModel"
		}, 
		templateUrl: "/widgets/ddns-network-settings-edit.html", 
		controller: "ddnsNetworkSettingsEdit"
	};
})
.controller("ddnsNetworkSettingsEdit", function($scope, $rpc, $tr, gettext, $ethernet, $network){
	$scope.data = {};
	$scope.allSourceTypes = [
		{ label: $tr(gettext("Interface")), value: "interface" }, 
		{ label: $tr(gettext("Network")), value: "network" }, 
		{ label: $tr(gettext("Script")), value: "script" }, 
		{ label: $tr(gettext("Web")), value: "web" }
	]; 
	$ethernet.getAdapters().done(function(adapters){
		$scope.allSourceDevices = adapters.map(function(a){
			return { label: a.name, value: a.device }; 
		}); 
		$scope.$apply(); 
	});
	$network.getNetworks().done(function(nets){
		$scope.allSourceNetworks = nets.map(function(n){
			return { label: n[".name"], value: n[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	$rpc.juci.ddns.providers().done(function(result){
		if(!result || !result.providers) return; 
		$scope.allServices = result.providers.map(function(p){ return { label: p, value: p }}); 
		$scope.$apply(); 
	});
	$scope.$watch("ddns", function(ddns){
		if(!$scope.data || !ddns) return;
		$scope.data.name = ddns[".name"];
	},false);
	$scope.$watch("data.name", function(name){
		if(!name || !$scope.ddns) return;
		$scope.ddns[".name"] == name;
	},false);
}); 
