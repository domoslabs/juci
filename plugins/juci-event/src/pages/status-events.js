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
.controller("StatusEventsPageCtrl", function($scope, $rpc, $config, $tr, gettext){
	var AllLogs;
	// to make it possible to send sid to cgi-bin!!
	if($rpc.$sid) $scope.sid = $rpc.$sid();
	JUCI.interval.repeat("event-log-page", 5000, function(next){
		$rpc.$call("router", "logs").done(function(data){
			if(!data || !data.logs) return;
			AllLogs = data.logs;
			AllLogs.reverse();
			$scope.update();
			$scope.$apply();
		}).always(function(){next();});
	});
	var log = {
		autoRefresh : true
	};
	$scope.order = 'time';
	$scope.reverse = true;
	$scope.setOrder = function(order){
		if($scope.order === order){
			$scope.reverse = !$scope.reverse;
		}else{
			$scope.order = order;
		}
	}
	$scope.data = { limit: 20, filter: "", type: "" };
	$scope.logs = [];
	$scope.filters = [];
	if($config.settings && $config.settings.juci_event){
		$config.settings.juci_event.filter.value.map(function(x){
			var filter = x.split(".")[0];
			var id = x.split(".")[1];
			if(inFilters(filter) === -1) $scope.filters.push({name:filter, filters:[id], checked:false});
			else $scope.filters[inFilters(filter)].filters.push(id);
		});
	}
	function inFilters(filter){
		for(var i = 0; i < $scope.filters.length; i++){
			if($scope.filters[i].name == filter) return i;
		}
		return -1;
	}
	$scope.downloadLogs = function(){
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		var string = "JUCI Logs";
		AllLogs.map(function(log){
			string += "\n" + JSON.stringify(log);
		});
		var blob = new Blob([string],{type:"application/json"});
		url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = "juci-logs.txt";
		a.click();
		window.URL.revokeObjectURL(url);
	}
	$scope.update = function(update){
		if(!AllLogs) return;
		var sources = [];
		$scope.filters.map(function(f){
			if(!f.checked) return;
			f.filters.map(function(x){
				sources.push(x);
			});
		});
		$scope.logs = AllLogs.filter(function(log){
			if(sources.length && !sources.find(function(x){ return log.source.match(RegExp(x));})) return false;
			return (log.message.match(RegExp($scope.data.filter)) || 
					log.source.match(RegExp($scope.data.filter))) &&
					log.id.match(RegExp($scope.data.type));
		}).slice(0, $scope.data.limit);
	}
	$scope.$watch("data.limit", function(lim){
		if(!lim) return;
		$scope.update();
	}, false);
	$scope.$watch("data.type", function(type){
		if(!type) return;
		$scope.update();
	}, false);

	$scope.allLimits = [
		{ label: 20, value: 20 }, 
		{ label: 50, value: 50 }, 
		{ label: 100, value: 100 }, 
		{ label: 200, value: 200 }
	]; 
	$scope.types = [
		{ label:$tr(gettext("All types")),		value: "" },
		{ label:$tr(gettext("Emergency")),		value: "emerg" },
		{ label:$tr(gettext("Alert")),			value: "alert" },
		{ label:$tr(gettext("Critical")),		value: "crit" },
		{ label:$tr(gettext("Warning")),		value: "warn" },
		{ label:$tr(gettext("Notice")),			value: "notice" },
		{ label:$tr(gettext("Informational")),	value: "info" },
		{ label:$tr(gettext("Debug")),			value: "debug" }
	];

	$scope.lineClass = function(line){
		if(line.id.indexOf("error") >= 0) return "label-danger"; 
		if(line.id.indexOf("warn") >= 0) return "label-warning";  
		if(line.id.indexOf("notice") >= 0 || line.id.indexOf("info") >= 0) return "label-info"; 
		return ""; 
	}
}); 
