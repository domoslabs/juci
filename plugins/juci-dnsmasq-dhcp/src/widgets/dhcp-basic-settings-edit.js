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
.directive("dhcpBasicSettingsEdit", function(){
	return {
		scope: {
			dhcp: "=ngModel", 
			connection: "=ngConnection",
			hideAdvanced: "@",
			hideIpv6: "@"
		}, 
		templateUrl: "/widgets/dhcp-basic-settings-edit.html", 
		controller: "dhcpBasicSettingsEdit"
	};  
})
.controller("dhcpBasicSettingsEdit", function($scope, $network, $tr, gettext){
	$scope.data = {};
	$scope.data.dhcp = { field1:"", field2:"" };
	
	$scope.dhcpLeaseTimes = [
		{ label: "5 "+$tr(gettext("Minutes")), value: "5m"}, 
		{ label: "30 "+$tr(gettext("Minutes")), value: "30m"}, 
		{ label: "1 "+$tr(gettext("Hour")), value: "1h" }, 
		{ label: "6 "+$tr(gettext("Hours")), value: "6h" }, 
		{ label: "12 "+$tr(gettext("Hours")), value: "12h" }, 
		{ label: "24 "+$tr(gettext("Hours")), value: "24h" }
	];  
	$scope.dhcpv6Values = [
		{ label: "Server", value: "server" }, 
		{ label: "Relay", value: "relay" }, 
		{ label: "Disabled", value: "disabled" }, 
	];  
	$scope.raValues = $scope.dhcpv6Values;
	$scope.ndpValues = [
		{ label: "Relay", value: "relay" }, 
		{ label: "None", value: "" }, 
	];

	$scope.$watch("dhcp", function(){
		if(!$scope.dhcp){ return; }
		$scope.data.dhcp_options = $scope.dhcp.dhcp_option.value;
	},false);

	$scope.addDHCPOption = function(){
		var f1 = $scope.data.dhcp.field1;
		var f2 = $scope.data.dhcp.field2;
		if(f1 && f2){
			if(f1>255 || f1<0){
				alert("Tag must be 0-255.");
				return;
			}
			var newList = $scope.dhcp.dhcp_option.value.slice();
			var newString = f1+","+f2;
			if(newList.indexOf(newString) === -1){
				newList.push(newString);
				$scope.data.dhcp_options = newList.slice();
				$scope.dhcp.dhcp_option.value = newList.slice();
				$scope.data.dhcp.field1 = "";
				$scope.data.dhcp.field2 = "";
			}
			else{
				alert(newString+" Already added.");
			}
		}
	};
	$scope.deleteDHCPOption = function(d){
		var newList = $scope.dhcp.dhcp_option.value.slice();
		newList.splice(newList.indexOf(d),1);

		$scope.data.dhcp_options = newList.slice();
		$scope.dhcp.dhcp_option.value = newList.slice();
	};

	
}); 
