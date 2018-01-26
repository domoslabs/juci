/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.directive("networkDslLineEditor", function(){
	return {
		templateUrl: "/widgets/network-dsl-line-editor.html",
		scope: {
			line: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkDslLineEditorCtrl"
	};
}).controller("networkDslLineEditorCtrl", function($scope){
	$scope.data = {
		modes: [],
		out_modes: [],
		profiles: [],
		out_profiles: []
	}

	var modes = [
		["G.dmt","gdmt"],
		["G.lite","glite"],
		["T1.143","t1413"],
		["ADSL2","adsl2"],
		["ADSL2+","adsl2p"],
		["READSL2","annexl"],
		["ADSL2 M","annexm"],
		["VDSL2","vdsl2"],
		["G.fast","gfast"]
	];

	var profiles = [
		"8a",
		"8b",
		"8c",
		"8d",
		"12a",
		"12b",
		"17a",
		"30a",
		"35b"
	];

	$scope.$watch("line", function(line) {
		if(!line) return;

		$scope.data.modes = modes.map(function(mode) {
			var m_obj = {};

			m_obj.label = mode[0];
			m_obj.value = mode[1];

			var found = line.mode.value.find(function(m) {
				return m === mode[1];
			});

			if(found === undefined)
				m_obj.selected = false;
			else
				m_obj.selected = true;

			return m_obj;
		});

		$scope.data.profiles = profiles.map(function(p) {
			var profile = {};

			profile.label = p;
			profile.value = p;

			var found = line.profile.value.find(function(p_conf) {
				return p_conf === p;
			});

			if(found === undefined)
				profile.selected = false;
			else
				profile.selected = true;

			return profile;
		});
	}, false);

	$scope.$watch("data.out_modes", function(output) {
		if(!output || !$scope.line) return;

		$scope.line.mode.value = output.map(function(o) {return o.value});
	}, true);


	$scope.$watch("data.out_profiles", function(output) {
		if(!output || !$scope.line) return;

		$scope.line.profile.value = output.map(function(o) {return o.value});
	}, true);

	$scope.has_vdsl2 = function() {
		if(!$scope.line) return;

		return $scope.line.mode.value.indexOf("vdsl2") > -1;
	};
});
