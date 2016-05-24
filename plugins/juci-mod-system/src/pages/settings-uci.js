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
.controller("SettingsUCIController", function($scope, $rpc){
	var configs = {}; 
	$scope.loading = 0; 
	function filterHiddenValues(values){
		var ret = {}; 
		Object.keys(values).map(function(v){
			if(v.indexOf(".") != 0) ret[v] = values[v]; 
		}); 
		return ret; 
	}
	$scope.onChangeSection = function(item){
		$scope.selectedConfig = item; 
		$scope.error = ""; 
		$scope.loading = 1; 
		$scope.subsections = {}; 
		$rpc.$call("uci", "state", {
			config: item.id
		}).done(function(data){
			$scope.subsections = data.values; 
			Object.keys($scope.subsections).map(function(k){
				$scope.subsections[k] = filterHiddenValues($scope.subsections[k]); 
			}); 
			$scope.loading = 0; 
			$scope.$apply(); 
		}).fail(function(){
			$scope.error = "Could not retreive data!"; 
			$scope.loading = 0; 
			$scope.$apply(); 
		});  
	}
	$scope.onSaveSection = function(id){
		if(!$scope.selectedConfig) return; 
		$scope.error = ""; 
		$rpc.$call("uci", "set", {
			"config": $scope.selectedConfig.id, 
			"section": id, 
			"values": $scope.subsections[id]
		}).done(function(){
			$rpc.$call("uci", "commit", {
				config: $scope.selectedConfig.id
			}).done(function(){
				$scope.onResetSection(id); 
			}); 
		}); 
	}
	$scope.onResetSection = function(id){
		$scope.error = ""; 
		if(!$scope.selectedConfig) return; 
		$rpc.$call("uci", "state", {
			config: $scope.selectedConfig.id, 
			section: id
		}).done(function(result){
			Object.assign($scope.subsections[id], filterHiddenValues(result.values)); 
			$scope.$apply(); 
		}); 
	}
	async.series([
		function(next){ $rpc.$call("uci", "configs").done(function(list){configs = list.configs; next(); }); }
	], function(){
		$scope.error = ""; 
		$scope.sections = configs.map(function(x){return {label: x, id: x};}); 
		$scope.$apply(); 
	})
	/*$rpc.$call("uci", "state", {
		config: "wireless"
	}).done(function(data){
		Object.keys(data.values).map(function(k){
			
		}); 
	}); */
}); 
