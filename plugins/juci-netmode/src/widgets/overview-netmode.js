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
.directive("overviewWidget90Netmode", function(){
	return {
		templateUrl: "widgets/overview-netmode.html", 
		controller: "overviewWidgetNetmode", 
		replace: true
	};
})
.controller("overviewWidgetNetmode", function($scope, $tr, gettext, $uci, $rpc, $juciConfirm, $juciDialog, $languages){
	$scope.data = {
		selected: ""
	};
	$scope.allNetmodes = [];
	$uci.$sync("netmode").done(function(){
		if(!$uci.netmode || !$uci.netmode.setup)return;
		var lang = $languages.getLanguage();
		if(lang !== "en" && lang !== "fi" && lang !== "sv") lang = "en";
		$scope.allNetmodes = $uci.netmode["@netmode"].map(function(nm){ 
			return { 
				longLabel: nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value, 
				label: (nm[("desc_"+lang)].value || nm.desc.value || nm["desc_en"].value).substring(0,20), 
				value: nm[".name"], 
				desc:  nm[("exp_"+lang)].value || nm.exp.value || nm["exp_en"].value || ""
			}; 
		});
		$scope.setup = $uci.netmode.setup;
		if(!$scope.setup) { $scope.$apply(); return;}
		var tmp = $scope.allNetmodes.find(function(nm){ return nm.value === $scope.setup.curmode.value; });
		$scope.data.selected = (tmp)?tmp.value:"";
		$scope.$apply();
	});
	$scope.disabled = function(){
		if(!$scope.data || !$scope.setup || !$scope.setup.curmode || $scope.allNetmodes.length < 1) return true;
		return $scope.data.selected === $scope.setup.curmode.value;
	}
	$scope.onChangeMode = function(){
		if(!$scope.setup || !$scope.setup.curmode || $scope.allNetmodes.length < 1) return;
		var model = {
			allNetmodes: $scope.allNetmodes,
			selected: $scope.setup.curmode.value
		};
		$juciDialog.show("netmode-picker", {
			title: $tr(gettext("Select Profile")),
			model: model,
			on_apply: function(){
				if(model.selected === $scope.setup.curmode.value) return true;
				setNetmode(model.selected);
				return true;
			}
		});
	};

	$scope.onChangeModeConfirm = function(){
		if(!$scope.data || !$scope.setup || !$scope.setup.curmode) return;
		if($scope.data.selected === $scope.setup.curmode.value) return;
		$juciConfirm.show($tr(gettext("Changing netmode will reset your configuration completely to match that netmode. Do you want to continue?"))).done(function(value){
			setNetmode($scope.data.selected);
		});
	}
	$scope.getExp = function(){
		if(!$scope.data || !$scope.data.selected || $scope.allNetmodes.length < 1) return "";
		var tmp = $scope.allNetmodes.find(function(nm){return nm.value === $scope.data.selected; });
		if(tmp && tmp.desc) return tmp.desc;
		return "";
	}
	$scope.getDesc = function(){
		if($scope.allNetmodes.length < 1) return "";
		var tmp = $scope.allNetmodes.find(function(nm){return nm.value === $scope.data.selected; });
		if(tmp && tmp.label) return tmp.label;
		return $tr(gettext("No profile selected"));
	}
	$scope.getFullDesc = function(){
		if(!$scope.data || !$scope.data.selected || $scope.allNetmodes.length < 1) return "";
		var tmp = $scope.allNetmodes.find(function(nm){return nm.value === $scope.data.selected; });
		if(tmp && tmp.longLabel) return tmp.longLabel;
		return "";
	}
	function setNetmode(netmode){
		$scope.data.selected = netmode;
		$scope.setup.curmode.value = netmode;
		$uci.$save().done(function(){
			if($uci.netmode[netmode].reboot.value){
				window.location = "/reboot.html";
			}
			setTimeout(function(){window.location.reload(true);}, 1000);
		});
	}
}); 
