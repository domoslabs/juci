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
.directive("overviewStatusWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode-small.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.directive("overviewWidget99Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	 };  
})
.controller("overviewWidgetNetmode", function($scope, $tr, gettext, $uci, $rpc, $juciConfirm, $juciDialog){
	$scope.data = {
		currentNetmode: ""
	};
	$uci.$sync("netmode").done(function(){
		$scope.allNetmodes = $uci.netmode["@netmode"].map(function(nm){ return { label: nm.desc.value, value: nm[".name"], desc: nm.exp.value }; });
		$scope.setup = $uci.netmode.setup;
		$scope.data.currentNetmode = $scope.setup.curmode.value;
		$scope.$apply();
	});
	$scope.onChangeMode = function(){
		if(!$scope.data || !$scope.data.currentNetmode || !$scope.setup || !$scope.setup.curmode) return;
		var model = {
			allNetmodes: $scope.allNetmodes,
			selected: $scope.data.currentNetmode
		};
		$juciDialog.show("netmode-picker", {
			title: $tr(gettext("Select Profile")),
			model: model,
			on_apply: function(btn, inst){
				if(model.selected == $scope.data.currentNetmode) return false;
				setNetmode(model.selected);
				return true;
			}
		});
	};

		
	$scope.onChangeModeConfirm = function(){
		if(!$scope.data || !$scope.data.currentNetmode || !$scope.setup || !$scope.setup.curmode) return;
		if($scope.data.currentNetmode == $scope.setup.curmode.value) return;
		$juciConfirm.show($tr(gettext("Changing netmode will reset your configuration completely to match that netmode. Do you want to continue?"))).done(function(value){
			if(value == "ok"){
				setNetmode($scope.data.currentNetmode);
			}
		});
	}
	function setNetmode(netmode){
		$scope.setup.curmode.value = netmode;
		$uci.$save().done(function(){
			if($uci.netmode[netmode].reboot.value){
				window.location = "/reboot.html";
			}
			$scope.$apply();
		});
	};
		
}); 
