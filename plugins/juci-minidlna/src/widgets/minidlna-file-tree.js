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
.directive("minidlnaFileTree", function(){
	return {
		templateUrl: "/widgets/minidlna-file-tree.html",
		scope: {
			model: "=ngModel"	
		},
		require: "^ngModel",
		controller: "minidlnaFileTreeController"
	};
}).controller("minidlnaFileTreeController", function($scope, $rpc, $tr, gettext){
	$scope.data = {
			tree: [{
			label: $tr(gettext("Loading.."))
		}], 
		dirtypes: [ 
			{ label: $tr(gettext("All types")), value:"" }, 
			{ label: $tr(gettext("Video only")), value:"V" },
			{ label: $tr(gettext("Audio only")), value:"A" },
			{ label: $tr(gettext("Pictures only")), value:"P" }
		]
	}; 
	$scope.model.selected_dirtype = $scope.data.dirtypes[0].value;
	$scope.on_select = function(branch){
		$scope.model.selected = branch; 
	}
	$rpc.juci.minidlna.folder_tree().done(function(data){
		function to_tree_format(obj){
			return Object.keys(obj).map(function(folder){
				if(obj[folder]["children"]){
					var tmp = {
						label: "/"+folder+"/",
						path: obj[folder]["path"]
					}
					if(typeof obj[folder]["children"] == "object"){
						tmp.children = to_tree_format(obj[folder]["children"]);
					}
					return tmp;
				}
			});
		}
		$scope.data.tree = to_tree_format(data); 
		$scope.model.selected = {};
		$scope.$apply();
	});
});
