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
.controller("InternetFirewallRulesPage", function($scope, $uci, $firewall, $tr, gettext){
	$firewall.getRules().done(function(rules){
		$scope.rules = rules;
		$scope.rules.map(function(rule){
			var values = [];
			if(rule.src_ip.value && rule.src_ip.value.length === 1) values.push({ label: $tr(gettext("Source IP")), value: rule.src_ip.value[0] });
			if(rule.src_ip.value && rule.src_ip.value.length > 1) values.push({ label: $tr(gettext("Source IP")), value: rule.src_ip.value[0] + "..." });
			if(rule.dest_ip.value && rule.dest_ip.value.length === 1) values.push({ label: $tr(gettext("Destination IP")), value: rule.dest_ip.value[0] });
			if(rule.dest_ip.value && rule.dest_ip.value.length > 1) values.push({ label: $tr(gettext("Destination IP")), value: rule.dest_ip.value[0] + "..." });
			if(rule.src_port.value) values.push({ label: $tr(gettext("Source Port(s)")), value: rule.src_port.value });
			if(rule.dest_port.value) values.push({ label: $tr(gettext("Destination Port(s)")), value: rule.dest_port.value });
			rule.$statusList = values;
		});
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
			"name": "new_rule",
			"hidden": true
		}).done(function(rule){
			$scope.$apply(); 
		}); 
	}
	$scope.onItemMoved = function(){
		if(!$uci.firewall) return;
		$uci.firewall.$save_order("rule");
	}
	
	$scope.onDeleteRule = function(rule){
		if(!rule) alert($tr(gettext("Please select a rule to delete!")));
		if(confirm($tr(gettext("Are you sure you want to delete this rule?")))){
			rule.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 
