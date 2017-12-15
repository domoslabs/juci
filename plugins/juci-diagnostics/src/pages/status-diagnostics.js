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
.controller("StatusDiagnostics", function($scope, $rpc, $tr, gettext, $events){
	$scope.data = {
		pingResults: [],
		pingv6: false,
		pingCount: 5,
		pingWait: 1,
		pingRunning: false,
		pingError: "",
		traceResults: [],
		tracev6: false,
		traceCount: 1,
		traceWait: 1,
		traceRunning: false,
		traceError: ""
	};
	$scope.onPingTest = function(){
		if($scope.validate("pingHost") !== null) return;
		$scope.data.pingError = "";
		var ping = $scope.data.ping6 ? "ping6" : "ping";
		var pingArgs = {
			"host": $scope.data.pingHost,
			"count": $scope.data.pingCount,
			"timeout": $scope.data.pingWait
		}
		$rpc.$call("juci.diagnostics", ping, pingArgs).done(function(result){
			if(result && result.state === "running") $scope.data.pingRunning = true;
			$scope.data.pingHost = "";
		}).fail(function(error){
			$scope.data.pingError = JSON.stringify(error);
		}).always(function(){
			$scope.$apply();
		});
	}
	$scope.onTraceTest = function(){
		if($scope.validate("traceHost") !== null) return;
		$scope.data.traceError = "";
		var trace = $scope.data.trace6 ? "traceroute6" : "traceroute";
		var traceArgs = {
			"host": $scope.data.traceHost,
			"count": $scope.data.traceCount,
			"timeout": $scope.data.traceWait
		}
		$rpc.$call("juci.diagnostics", trace, traceArgs).done(function(result){
			if(result && result.state === "running") $scope.data.traceRunning = true;
			$scope.data.traceHost = "";
		}).fail(function(error){
			$scope.data.traceError = JSON.stringify(error);
		}).always(function(){
			$scope.$apply();
		});
	}
	$scope.validate = function(type){
		if(!$scope.data || !$scope.data[type]) return null;
		if(String($scope.data[type]).match(/[^A-z0-9}\.\-]/)) return $tr(gettext("Not a valid domain or ip address"));
		return null;
	}
	$scope.deleteResult = function(res){
		$scope.data.pingResults = $scope.data.pingResults.filter(function(r){ return r !== res; });
		$scope.data.traceResults = $scope.data.traceResults.filter(function(r){ return r !== res; });
	}
	$events.subscribe("diagnostics.ping", function(res){
		if(res && res.data){
			if(res.data.stdout)
				$scope.data.pingResults.push(res.data.stdout);
			else if(res.data.stderr)
				$scope.data.pingError = res.data.stderr;
			$scope.data.pingRunning = false;
			$scope.$apply();
		}
	});
	$events.subscribe("diagnostics.ping6", function(res){
		if(res && res.data){
			if(res.data.stdout)
				$scope.data.pingResults.push(res.data.stdout);
			else if(res.data.stderr)
				$scope.data.pingError = res.data.stderr;
			$scope.data.pingRunning = false;
			$scope.$apply();
		}
	});
	$events.subscribe("diagnostics.traceroute", function(res){
		console.log(res);
		if(res && res.data){
			if(res.data.stdout)
				$scope.data.traceResults.push(res.data.stdout);
			else if(res.data.stderr)
				$scope.data.traceError = res.data.stderr;
			$scope.data.traceRunning = false;
			$scope.$apply();
		}
	});
	$events.subscribe("diagnostics.traceroute6", function(res){
		if(res && res.data){
			if(res.data.stdout)
				$scope.data.traceResults.push(res.data.stdout);
			else if(res.data.stderr)
				$scope.data.traceError = res.data.stderr;
			$scope.data.traceRunning = false;
			$scope.$apply();
		}
	});
});
