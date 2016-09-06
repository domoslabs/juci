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
.controller("DDNSPage", function ($scope, $uci, $tr, gettext) {
	$scope.data = {}; 
	$uci.$sync(["ddns"]).done(function () {
		$scope.ddns_list = $uci.ddns["@service"]; 
		$scope.ddns_list && $scope.ddns_list.length && $scope.ddns_list.map(function(ddns){
			ddns.$statusList = [
				["service_name", $tr(gettext("Provider"))],
				["domain", $tr(gettext("Domain name"))],
				["username", $tr(gettext("Username"))]
			].map(function(pair){
				if(!ddns[pair[0]] || !ddns[pair[0]].value) return null;
				return { label: pair[1], value: ddns[pair[0]].value };
			}).filter(function(f){ return f !== null; });
		});
		$scope.$apply(); 
	}); 

	function getNumber(){
		var done = false;
		var i = 0;
		while(!done){
			i = i + 1;
			if($scope.ddns_list.find(function(ddns){
				return ddns[".name"] === "Ddns_"+i;
			}) === undefined) done = true;
		}
		return i;
	}

	$scope.onAddDdnsSection = function(){
		$uci.ddns.$create({
			".type": "service", 
			".name": "Ddns_"+getNumber(),
			"enabled": true
		}).done(function(){
			$scope.$apply(); 
		}); 
	} 
	
	$scope.onRemoveDdnsSection = function(ddns){
		if(!ddns) return; 
		ddns.$delete().done(function(){
			$scope.$apply(); 
		});  
	}

	$scope.getItemTitle = function(item){
		return item[".name"]; 
	}
});
