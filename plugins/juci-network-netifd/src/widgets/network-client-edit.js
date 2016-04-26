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
.directive("networkClientEdit", function(){
	return {
		templateUrl: "/widgets/network-client-edit.html", 
		controller: "networkClientEdit", 
		scope: {
			model: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	};  
}).controller("networkClientEdit", function($scope, $uci){	
	$scope.$watch("model", function(value){
		if(!value || !value.client) return;
		$uci.$sync("dhcp").done(function(){
			$scope.staticLeses = $uci.dhcp["@host"];
			$scope.csh = $scope.staticLeses.filter(function(l){
				return l.mac.value === value.client.macaddr && l.network.value === value.client.network;
			})[0];
			$scope.$apply();
		});
		$scope.onAddStaticLease = function(){
			$uci.$sync("dhcp").done(function(){
				$uci.dhcp.$create({
					".type":"host",
					ip: $scope.model.client.ipaddr,
					mac: $scope.model.client.macaddr,
					network: $scope.model.client.network,
					name: $scope.model.client.hostname
				}).done(function(value){
					$scope.csh = value;
				});
			});
		}
		$scope.onDeleteStaticLease = function(){
			if(!$scope.csh || !$scope.csh.$delete) return;
			$scope.csh.$delete().done(function(){
				$scope.csh = null;
				$scope.$apply();
			});
		}
		$scope.values = Object.keys(value.client).map(function(x){
			if(x.match(/^_.+$/)) return null;
			return { label: x, value: value.client[x] };
		}).filter(function(x){ return x !== null;});
	},false);
}); 

