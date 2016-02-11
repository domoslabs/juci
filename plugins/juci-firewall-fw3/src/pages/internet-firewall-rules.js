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
.controller("InternetFirewallRulesPage", function($scope, $uci, $firewall){
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	}); 
	$uci.$sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.$apply(); 
	});  
	$scope.getItemTitle = function(item){
		return item.name.value || item[".name"]; 
	}
	
	
	$scope.onCreateRule = function(){
		$uci.firewall.$create({
			".type": "rule", 
			"name": "new_rule"
		}).done(function(rule){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteRule = function(rule){
		if(!rule) alert(gettext("Please select a rule to delete!")); 
		if(confirm(gettext("Are you sure you want to delete this rule?"))){
			rule.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 
