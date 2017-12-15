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
.directive("sambaUserEdit", function(){
	return {
		scope: {
			user: "=ngModel"
		}, 
		templateUrl: "/widgets/samba-user-edit.html", 
		controller: "sambaUserEdit",
		replace: true
	};
})
.controller("sambaUserEdit", function($scope, $rpc){
	var passwd_entries = [];

	$rpc.$call("juci.system","passwd_entries").done(function(passwd_entriesIn){
		passwd_entries = passwd_entriesIn.entries;
	});

	$scope.$watch("user", function(user){
		if (!$scope.user || !$scope.user.user){ return; }

		var validUsername = function(){ //TODO: TRANSLATE
			this.validate = function(x){
				if (passwd_entries.indexOf(user.user.value) !== -1) {
					var errormsg = "Samba username '"+user.user.value+"' taken or not allowed.";
					return errormsg;
				}
				if (!user.user.value.match(/^[0-9a-zA-Z_.-]+$/)){ // POSIX.1-2008: 3.437 User Name
					var errormsg = "Samba username may only contain numbers, english letters, underscore, dot and hyphen.";
					return errormsg;
				}
				if (user.user.value.match(/^[-]+[0-9a-zA-Z_.-]*$/)){ // POSIX.1-2008: 3.437 User Name
					var errormsg = "Samba username may not start with a hyphen.";
					return errormsg;
				}

				return null;
			}
		}
		user.user.validator = new validUsername();

	},false);
}); 
