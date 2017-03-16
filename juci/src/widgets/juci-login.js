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
.directive("juciLogin", function(){
	return {
		// accepted parameters for this tag
		scope: {
		},
		templateUrl: "/widgets/juci-login.html",
		replace: true,
		controller: "LoginControl",
		controllerAs: "ctrl"
	};
})
.controller("LoginControl", function($scope, $config, $state, $rpc, $localStorage, $tr, gettext){
	$scope.form = {
		"username": "",
		"password": ""
	};
	$rpc.$call("juci.unauthenticated", "username").done(function(data){
		$scope.form.username = data.username;
		$scope.$apply();
	}).fail(function(e){ console.log(e); });

	$scope.errors = [];

	$scope.doLogin = function(){
		$scope.errors = [];
		$scope.logging_in = true;
		$rpc.$login({
			"username": $scope.form.username,
			"password": $scope.form.password
		}).done(function success(res){
			window.location.href="/";
		}).fail(function fail(res){
			$scope.logging_in = false;
			if(res === "Session not found")
				location.reload();
			console.log(res);
			$scope.errors.push($tr(gettext("Please enter correct username and password!")));
			$scope.$apply();
		});
	}

	$scope.doLogout = function(){
		var deferred = $.Deferred();
		$rpc.$logout().done(function(){
			console.log("Logged out!");
			JUCI.redirect("overview");
			deferred.resolve();
		}).fail(function(){
			console.error("Error logging out!");
			deferred.reject();
		});
		return deferred.promise();
	}
});
		
