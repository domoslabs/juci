/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
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
.controller("wirelessFilteringPage", function($scope, $wireless){
	$scope.match = function (src, match) {
		if (typeof src !== "string" || typeof match !== "string") return false;
		if (src.match(RegExp(match)))
			return true;
		return false;
	}
	$wireless.getInterfaces().done(function(interfaces){
		$scope.interfaces = interfaces.filter(function(iface){
			iface[".macfilter_enabled"] = (iface.macfilter.value.indexOf("disable") == -1 ? 1 : 0)
			return iface.mode && iface.mode.value == "ap";
		});

		$scope.$apply();
	}).fail(function(err){
		console.log("failed to sync config: "+err);
	});
});
