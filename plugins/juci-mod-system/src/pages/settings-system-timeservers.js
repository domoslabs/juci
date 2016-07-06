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
.controller("SettingsSystemTimeservers", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync("system").done(function(){
		if(!$uci.system.ntp) return; 
		$scope.ntp = $uci.system.ntp;
		$scope.ntp_servers = $uci.system.ntp.server.value.map(function(x){ return { server: x }; }); 
		$scope.$apply(); 
		$scope.$watch("ntp_servers", function(){
			$uci.system.ntp.server.value = []; 
			$scope.ntp_servers.map(function(ntp){
				$uci.system.ntp.server.value.push(ntp.server); 
			}); 
		}, true); 
		$scope.onDeleteNTPServer = function(ntp){
			$scope.ntp_servers = $scope.ntp_servers.filter(function(x){ return x != ntp; }); 
		}
		$scope.onAddNTPServer = function(){
			if(!$uci.system.ntp) return; 
			$scope.ntp_servers.push({ server: "" }); 
		}
	}); 
});

