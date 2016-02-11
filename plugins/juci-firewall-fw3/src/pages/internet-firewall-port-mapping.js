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
.controller("InternetPortMappingPageCtrl", function($scope, $uci, $rpc, $tr, gettext){
	function reload(){
		$uci.$sync("firewall").done(function(){
			$scope.redirects = $uci.firewall["@redirect"];
			$scope.$apply(); 
		}); 
	} reload(); 
	
	$scope.onAddRule = function(net){
		$uci.firewall.$create({
			".type": "redirect", 
			"name": "new_rule",
			"src": "wan", 
			"dest": "lan", 
			"target": "DNAT"
		}).done(function(section){
			$scope.rule = section; 
			$scope.rule[".new"] = true; 
			$scope.$apply(); 
		}); 
	};
	
	$scope.onEditRule = function(rule){
		if(!rule) return; 
		rule.$begin_edit(); 
		$scope.rule = rule; 
	};
	
	$scope.onDeleteRule = function(rule){
		rule.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};
	
	$scope.onAcceptEdit = function(){
		$scope.errors = $scope.rule.$getErrors(); 
		if($scope.errors.length) return; 
		var found = $uci.firewall["@redirect"].find(function(x){
			return x != $scope.rule && x.name.value == $scope.rule.name.value; 
		}); 
		if(found) { alert($tr(gettext("A port forwarding rule with the same name already exists! Please specify a different name!"))); return; }
		$scope.rule[".new"] = false; 
		$scope.rule = null;  
	};
	
	$scope.onCancelEdit = function(){
		if(!$scope.rule) return; 
		$scope.rule.$cancel_edit(); 
		if($scope.rule[".new"]){
			$scope.rule.$delete().done(function(){
				$scope.rule = null; 
				$scope.$apply(); 
			}); 
		} else {
			$scope.rule = null; 
		}
	}
}); 
