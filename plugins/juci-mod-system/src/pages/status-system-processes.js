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
.controller("StatusSystemProcesses", function ($scope, $rpc, gettext, $tr) {
	JUCI.interval.repeat("juci-process-list", 5000, function(done){
		$rpc.juci.system.process.list().done(function(processes){
			$scope.processes = processes.list; 
			$scope.columns = processes.fields; 
			$scope.$apply(); 
			done(); 
		});
	}); 
	$scope.isopen = false;
	$scope.getCpuUsage = function(){
		if(!$scope.processes) return '0%'
		var sum = 0;
		$scope.processes.map(function(x){sum += Number(x["%CPU"].slice(0, -1));});
		return sum + '%'
	};
}); 
