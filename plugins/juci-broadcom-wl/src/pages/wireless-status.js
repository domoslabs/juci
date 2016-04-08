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
.controller("wirelessStatusPage", function($scope, $uci, $wireless, gettext, $rpc){
	$scope.radios = [];
	$scope.interfaces = [];
	$scope.clients = [];
	$scope.clientsTbl = [];

	$uci.$sync("wireless").done(function(){
		async.series([
			function(next){
				$wireless.getDevices().done(function(rds){
					$scope.radios = rds;
					$scope.radios.map(function(radio){ radio[".interfaces"] = []; });
					console.log($scope.radios);
				})
				.always(function(){ next(); });
			},
			function(next){
				$wireless.getInterfaces().done(function(ifs){
					$scope.interfaces = ifs;
					$scope.interfaces.map(function(i){ i[".clients"] = []; });
					console.log($scope.interfaces);
				})
				.always(function(){ next(); });
			},
			function(next){
				$wireless.getConnectedClients().done(function(cls){
					$scope.clients = cls;
					//$scope.clientsTbl = cls.map(function(prop){ $scope.clientsTbl.push([prop,cls[prop]]) });
					console.log($scope.clients);
					console.log($scope.clientsTbl);
				})
				.always(function(){ next(); });
			}],
			function(){
				// Add clients to interfaces
				$scope.clients.map(function(client){
					var iface = $scope.interfaces.find(function(i){
						return i["ifname"]["value"] === client["wdev"];
					});
					iface[".clients"].push(client);
				});
				//Add interfaces to radios
				$scope.interfaces.map(function(iface){
					var radio = $scope.radios.find(function(r){
						return r[".name"] === iface["device"]["value"];
					});
					radio[".interfaces"].push(iface);
				});
				$scope.$apply();
			}
		);
		
	}); 
}); 
