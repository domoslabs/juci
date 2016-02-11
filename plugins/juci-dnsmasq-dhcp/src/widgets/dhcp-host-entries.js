/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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

JUCI.app.directive("dhcpHostEntries", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-host-entries.html",
		controller: "dhcpHostEntriesCtrl",
		replace: true
	}
}).controller("dhcpHostEntriesCtrl", function($scope, $uci, $tr, gettext, lanIpFactory){
	$uci.$sync("dhcp").done(function(){
		$scope.hosts = $uci.dhcp["@domain"];
		$scope.$apply();
	});
	$scope.ipv4 = "";
	$scope.ipv6 = "";
	
	lanIpFactory.getIp().done(function(res){
		$scope.ipv4 = res.ipv4;
		$scope.ipv6 = res.ipv6;
	});
	
	$scope.getItemTitle = function(item){
		return $tr(gettext("Hostname(s) for ")) + ((item.ip.value == "") ? ((item.family.value == "ipv4") ? $scope.ipv4 : $scope.ipv6) : item.ip.value);
		return item[".name"];
	}
	$scope.onAddDomain = function(){
		$uci.dhcp.$create({ ".type":"domain", "family":"ipv4"}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onDeleteDomain = function(domain) {
		domain.$delete().done(function(){
			$scope.$apply();
		});
	};
});

