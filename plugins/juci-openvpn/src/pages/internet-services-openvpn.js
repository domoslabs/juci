/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author:
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
.controller("OpenVPNController", function($scope, $tr, gettext, $uci, $openvpn){
	$scope.data = {
		networks: [],
		output: [],
		passwd_entries: []
	};

	$uci.$sync("openvpn").done(function(res){
		$scope.openvpn = $uci.openvpn["@openvpn"][0];
		//$scope.openvpn.config = $scope.openvpn.auth_user.value+$scope.openvpn.auth_user.value;
		console.log($scope.openvpn);
	}
	);

});
