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
.directive("juciListEditor", function(){
	return {
		scope: {
			items: "=ngItems",
			showIcon: "=",
			iconStatus: "&",
			editor: "@itemEditor",
			editable: "@allowEdit",
			sortable: "@sortable",
			getItemTitle: "&getItemTitle",
			onCreate: "&onCreate",
			onDelete: "&onDelete",
			onUpdate: "&onUpdate",
			onEditStart: "&onEditStart",
			onItemMoved: "&onItemMoved",
			hideButtons: "@hideButtons"
		},
		controller: "juciListEditor",
		templateUrl: "/widgets/juci-list-editor.html",
		compile: function(element, attrs){
		   if (!attrs.allowEdit) { attrs.allowEdit = true; }
		   if (attrs.allowEdit == "false") { attrs.allowEdit = false; }
		}
	};
})
.controller("juciListEditor", function($scope, $location, $anchorScroll){
	$scope.hide = true;
	if($scope.editor) $scope.dynamicHtml = "<"+$scope.editor+" ng-model='item'/>";
	$scope.onListAddItem = function(){
		$scope.onCreate();
	}
	$scope.hideEditor = function(){
		$scope.hide = true;
	}
	$scope.onListEditItem = function(i){
		if(!$scope.canEdit(i)) return;
		$scope.item = i;
		$scope.hide = false;
		$scope.onEditStart({"$item": i});
		$location.hash('editor');
		// call $anchorScroll()
		$anchorScroll();
	}
	$scope.onListRemoveItem = function(i){
		$scope.onDelete({"$item": i});
		$scope.hide = true;
	}
	$scope.onMoveUp = function(i){
		var arr = $scope.items;
		var idx = arr.indexOf(i);
		// return if either not found or already at the top
		if(idx == -1 || idx == 0) return;
		arr.splice(idx, 1);
		arr.splice(idx - 1, 0, i);
		$scope.onItemMoved({ $item: i, $prev_index: idx, $index: idx - 1});
	}
	$scope.getIcon = function(iconStatus){
		if(iconStatus == "muted") 	return "fa fa-circle fa-2x text-muted";
		if(iconStatus == "primary") 	return "fa fa-circle fa-2x text-primary";
		if(iconStatus == "success") 	return "fa fa-circle fa-2x text-success";
		if(iconStatus == "info") 	return "fa fa-circle fa-2x text-info";
		if(iconStatus == "warning") 	return "fa fa-times-circle fa-2x text-warning";
		if(iconStatus == "danger") 	return "fa fa-times-circle fa-2x text-danger";
		if(iconStatus == "offline") 	return "fa fa-times-circle fa-2x";
		if(iconStatus == "pending") 	return "fa fa-spinner fa-2x fa-spin text-warning";
		if(iconStatus == "online")	return "fa fa-check-circle fa-2x text-success";
		return "";
	};

	$scope.onMoveDown = function(i){
		var arr = $scope.items;
		var idx = arr.indexOf(i);
		// return if either not found or already at the bottom
		if(idx == -1 || idx == arr.length - 1) return;
		arr.splice(idx, 1);
		arr.splice(idx + 1, 0, i);
		$scope.onItemMoved({ $item: i, $prev_index: idx, $index: idx + 1});
	}

	$scope.canEdit = function(section){
		if(!section || !section.constructor || section.constructor.name !== "UCISection") return true;
		if(!section.$can_edit || !section.$can_edit instanceof Function) return true;
		return section.$can_edit();
	}
});
