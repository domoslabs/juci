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
.controller("juciSettingsUsersPageCtrl", function($scope, $rpc, $uci, $tr, gettext){
	$scope.dropdown_texts = {
		selectAll:	$tr(gettext("Select All")),
		selectNone:	$tr(gettext("Select None")),
		reset:		$tr(gettext("Reset")),
		search:		$tr(gettext("Search...")),
		nothingSelected:$tr(gettext("All users"))
	};
	$uci.$sync([ "juci", "passwords" ]).done(function(){
		if(!$uci.juci || !$uci.passwords) return;
		$scope.users = ($uci.passwords["@usertype"] || []).map(function(user){ return user[".name"];});
		$scope.users.push("unused");
		function name_in_list(list, name){
			return list.indexOf(name) !== -1;
		}
		$scope.uci_pages = $uci.juci["@menu"] || [];
		$scope.pages =  $scope.uci_pages.map(function(page){
			return {
				users: $scope.users.map(function(user){
					return {
						label: user,
						selected: name_in_list(page.expose.value, user)
					}
				}).concat(page.expose.value.filter(function(exp){
					return !name_in_list($scope.users, exp);
					}).map(function(exp){
						return {
							label: exp,
							selected: true
						}
					})
				),
				name: page.page.value,
				out: [],
				hide: page.redirect.value === "first"
			};
		}).filter(function(page){ return page;});

		/* update config when any dropdown is changed */
		$scope.$watch(function(){
			if(!$scope.pages)
				return;
			return $scope.pages.map(function(page){
				return page.out;
			});
		}, function(lists){
			if(!lists)
				return;
			lists.forEach(function(users, index){
				if(!$scope.uci_pages || !$scope.uci_pages[index])
					return;
				var page = $scope.uci_pages[index];

				/* 1. filter out the selected users and transform
				 * them to an array of strings */
				var selected_users = users.filter(function(user){
					return user.selected
				}).map(function(user){
					return user.label;
				});

				/* 2. if unused is in list of selected users select only that one */
				if(selected_users.indexOf("unused") !== -1) {
					$scope.pages[index].users.forEach(function(user){
						if(user.label !== "unused")
							user.selected = false;
					});
					selected_users = ["unused"];
				}

				/* 3. concatenate expose.value with selected_users */
				if (equals(selected_users, page.expose.ovalue))
					page.expose.$reset();
				else
					page.expose.value = selected_users;
			});
		}, true);

		$scope.$apply();
	});

	/* checks if two arrays contain the same entries */
	function equals(array1, array2){
		if(array1.length !== array2.length)
			return false;
		array1.sort();
		array2.sort();
		return array1.toString() === array2.toString();
	}
});
