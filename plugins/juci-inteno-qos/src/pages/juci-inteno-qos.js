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


JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext, intenoQos){
	$uci.$sync(["qos"]).done(function(){
		$scope.qos = $uci.qos["@classify"];
		$scope.$apply();
	});

	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ return { label: x, value: x }; }); 
		$scope.$apply(); 
	}); 

	$scope.onAddRule = function(item){
		$uci.qos.$create({
			".type": "classify"
		}).done(function(section){
			$scope.$apply(); 
		}); 
	};

	$scope.onDeleteRule = function(item){
		if(!item) return; 
		item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};

	$scope.onItemMoved = function(){
		$uci.qos.$save_order("classify"); 
	}
});
