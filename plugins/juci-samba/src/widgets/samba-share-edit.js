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

JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

JUCI.app
.directive("sambaShareEdit", function($compile){
	return {
		scope: {
			share: "=ngModel"
		}, 
		templateUrl: "/widgets/samba-share-edit.html", 
		controller: "sambaShareEdit", 
		replace: true
	 };  
})
.controller("sambaShareEdit", function($scope, $network, $modal, $juciDialog, $tr, gettext, $uci){
	$scope.data = {}; 
	$scope.users = {
		all: [],
		out: []
	};

	$scope.$watch("share", function(value){
		if(!value) return; 
		$scope.data.model = (value.path.value.length > 3) ? value.path.value.slice(4): "";
		$uci.$sync("samba").done(function(){
			var users = $uci.samba["@sambausers"];
			var selected = value.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	}); 
	$scope.reloadUsers = function(){
		if(!$scope.share) return;
		$uci.$sync("samba").done(function(){
			var users = $uci.samba["@sambausers"];
			var selected = $scope.share.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	};

	$scope.$watch("users.out", function(){
		if(!$scope.users || !$scope.users.out || !$scope.share) return;
		$scope.share.users.value = $scope.users.out.map(function(user){ return user.value; }).join(",");
	}, false);
	$scope.$watch("data.model", function(value){
		if(!$scope.share) return;
		$scope.share.path.value = "/mnt" + value;
	}, false);

	var def = null
	$scope.onAutocomplete = function(query){
		if(!def){
			var def = $.Deferred(); 
			$scope.loadingLocations = true;
			$rpc.juci.samba.autocomplete({ path: query.slice(1) }).done(function(result){
				def.resolve(result.folders); 
			}).fail(function(){
				def.reject(); 
			}).always(function(){def = null; $scope.loadingLocations = false;});
		}
		return def.promise(); 
	}
	$scope.onAddFolder = function(){
		var model = {}
		$juciDialog.show("samba-file-tree", {
			title: $tr(gettext("Add folder to share")),
			model: model,
			on_apply: function(btn, dlg){
				if(!model.path)return true;
					$scope.data.model = model.path;
				return true;
			}	
		});
	};

}); 
