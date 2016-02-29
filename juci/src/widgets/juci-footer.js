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
.directive("juciFooter", function(){
	return {
		templateUrl: "/widgets/juci-footer.html", 
		controller: "juciFooter"
	}; 
})
.controller("juciFooter", function($scope, $rpc, $firewall, $languages, gettextCatalog, gettext, $tr, $config){
	// TODO: move this into a higher level controller maybe? 
	$scope.languages = $languages.getLanguages();
	$scope.isActiveLanguage = function(lang){
		return gettextCatalog.getCurrentLanguage() == lang.short_code; 
	}
	$scope.setLanguage = function(lang){
		$languages.setLanguage(lang.short_code); 
	}; 
	$scope.wanifs = []; 

	$scope.onLogout = function(){
		console.log("logging out");
		$rpc.$logout().always(function(){
			window.location.href="/";
		});
	}
	$firewall.getZoneNetworks("wan").done(function(networks){
		$scope.wanifs = networks.map(function(x){ return x.$info; }); 
		$scope.$apply(); 
	}); 
	$rpc.system.board().done(function(res){
		board = res;
		$scope.firmware = board.release.distribution + " " + board.release.version + " " + board.release.revision; 
		$scope.$apply(); 
	})
}); 
