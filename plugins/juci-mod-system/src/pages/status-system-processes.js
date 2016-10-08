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
.controller("StatusSystemProcesses", function ($scope, $rpc) {
	JUCI.interval.repeat("juci-process-list", 5000, function(done){
		$rpc.$call("router.system", "processes", {}).done(function(processes){
			$scope.processes = processes.processes.map(function(l){ l["VSZP"] = l["%VSZ"]; delete l["%VSZ"]; l["CPU"] = l["%CPU"]; delete l["%CPU"]; return l;});
			$scope.columns = processes.fields.map(function(c){ if(c === "%VSZ") return "VSZP"; else if(c === "%CPU") return "CPU"; else return c;});
			if(!$scope.order && $scope.columns && $scope.columns.length) $scope.order = $scope.columns[0];
			$scope.$apply(); 
			done(); 
		});
	}); 
	$scope.reverse = false;
	$scope.orderFunction = function(v1, v2){
		if(v1.match(/^[0-9]+$/) && v2.match(/^[0-9]+$/))
			return parseInt(v1) < parseInt(v2);
		else return v1 < v2;
	}
	$scope.setOrder = function(col){
		if($scope.order && $scope.order === col)
			$scope.reverse = !$scope.reverse;
		else
			$scope.order = col.replace(/%/g, "");
	}
	$scope.isopen = false;
	$scope.getCpuUsage = function(){
		if(!$scope.processes) return '0%'
		var sum = 0;
		$scope.processes.map(function(x){sum += Number(x["CPU"].slice(0, -1));});
		return sum + '%'
	};
}); 
