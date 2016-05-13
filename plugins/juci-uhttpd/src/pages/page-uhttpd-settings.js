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
.controller("PageUhttpdSettings", function($scope, $uci, $systemService){
	$scope.logopts = {ubus_status: {value: []}};
	$scope.status = {
		all: [
			{label: "OK",		value: "ok"},
			{label: "Invalid command",	value: "invalid_command"},
			{label: "Invalid argument",	value: "invalid_argument"},
			{label: "Method not found", value: "method_not_found"},
			{label: "Object not found", value: "object_not_found"},
			{label: "No data",			value: "no_data"},
			{label: "Permission denied",value: "permission_denied"},
			{label: "Timeout",			value: "timeout"},
			{label: "Not supported",	value: "not_supported"},
			{label: "Unknown error", 	value: "unknown_error"},
			{label: "Connection failed",value: "connection_failed"}
		],
		selectable: [],
		selected: ""
	};
	$scope.data = {status:  [],method: [], newMethod:""}
	$scope.addStatusItem = function(){
		var index = $scope.status.selectable.findIndex(function(st){ return st.value === $scope.status.selected;});
		if(index !== -1) $scope.data.status = $scope.data.status.concat($scope.status.selectable.splice(index, 1));
		$scope.status.selected = $scope.status.selectable.length?$scope.status.selectable[0].value : "";
	};
	$scope.deleteStatusItem = function(item){
		if(!item) return;
		var index = $scope.data.status.findIndex(function(st){ return item.value === st.value; });
		if(index !== -1) $scope.status.selectable = $scope.status.selectable.concat($scope.data.status.splice(index, 1));
		$scope.status.selected = $scope.status.selectable.length?$scope.status.selectable[0].value : "";
	};
	$scope.addMethodItem = function(){
		if($scope.data.newMethod.split(".").length !== 2 || $scope.data.newMethod.match(/\s/)){
			alert("The input must be on the form Object.Method and may not contain spaces");
			return;
		}
		if($scope.logopts.ubus_method.value.find(function(x){return (x == $scope.data.newMethod)})){
			alert("Method allredy in list, pease enter another one");
			return
		}
		$scope.logopts.ubus_method.value = $scope.logopts.ubus_method.value.concat([$scope.data.newMethod]);
		$scope.data.newMethod = "";
	};
	$scope.deleteMethodItem = function(item){
		$scope.logopts.ubus_method.value = $scope.logopts.ubus_method.value.filter(function(x){
			return (x != item);
		});
	};
	$scope.onTagChange = function(){
		$scope.config.listen_http.value = $scope.data.ips.map(function(x){ return x.text});
	}
	$uci.$sync("uhttpd").done(function(){
		$scope.config = $uci.uhttpd.main; 
		$scope.data.ips = $scope.config.listen_http.value.map(function(ip){return {text:ip} });;
		$scope.logopts = $uci.uhttpd.logopts;
		$scope.status.all.map(function(status){
			if($scope.logopts.ubus_status.value.find(function(st){
				return st === status.value;
			})){
				$scope.data.status.push(status);
			}else{
				$scope.status.selectable.push(status);
			}
		});
		$scope.status.selected = $scope.status.selectable.length?$scope.status.selectable[0].value : "";
		$scope.$watch("data.status", function(value){
			if(!value) return;
			$scope.logopts.ubus_status.value = value.map(function(x){
				return x.value;
			});
		}, true);
		$scope.$apply(); 
	}); 
}); 
