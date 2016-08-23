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
.directive("networkConnectionCreate", function(){
	return {
		templateUrl: "/widgets/network-connection-create.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkConnectionCreateModalCtrl"
	}
})
.controller("networkConnectionCreateModalCtrl", function($scope, $tr, gettext, $network, $firewall){
	$scope.interfaceTypes = [
		{ label: $tr(gettext("Uplink")), value: "uplink" },
		{ label: $tr(gettext("Downlink")), value: "downlink" },
		{ label: $tr(gettext("Unmanaged")), value: "none" }
	 ];
	$scope.evalName = function(name){
		if(!name) return;
		if(name == "") return $tr(gettext("Interface Name is needed"));
		if(!name.match(/^[a-zA-Z0-9]+$/)) return $tr(gettext("Interface names can only contain letters and numbers"));
		if(name.length > 12) return $tr(gettext("Interface name may only be 12 characters long"));
	}
})
