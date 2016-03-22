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
.controller("DDNSPage", function ($scope, $uci) {
	$scope.data = {}; 
	$uci.$sync(["ddns"]).done(function () {
		$scope.ddns_list = $uci.ddns["@service"]; 
		$scope.$apply(); 
	}); 

	$scope.onAddDdnsSection = function(){
		$uci.ddns.$create({
			".type": "service", 
			".name": "new ddns config",
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
