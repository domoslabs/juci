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
.controller("StatusDiagnostics", function($scope, $rpc, $network){
	$scope.data = {}; 
	$network.getNetworks().done(function(nets){
		$scope.data.allInterfaces = nets.map(function(x){ return { label: x[".name"], value: x[".name"] }; }); 
		$scope.$apply(); 
	}); 
	$scope.onTraceTest = function(){
		$rpc.juci.diagnostics.traceroute({ host: $scope.data.traceHost }).done(function(result){
			if(result.stderr) $scope.data.traceError = result.stderr; 
			$scope.data.traceResults = result.stdout; 
			$scope.$apply(); 
		}).fail(function(error){
			$scope.data.traceResults = ""; 
			$scope.data.traceError = JSON.stringify(error); 
			$scope.$apply(); 
		}); 
	}
	$scope.onPingTest = function(){
		$scope.data.pingResults = "..."; 
		$scope.data.error = "";
		$rpc.juci.diagnostics.ping({ host: $scope.data.pingHost }).done(function(result){
			if(result.stderr) $scope.data.pingError = result.stderr; 
			$scope.data.pingResults = result.stdout; 
			$scope.$apply(); 
		}).fail(function(error){
			$scope.data.pingResults = ""; 
			$scope.data.pingError = JSON.stringify(error); 
			$scope.$apply(); 
		}); 
	}
}); 
