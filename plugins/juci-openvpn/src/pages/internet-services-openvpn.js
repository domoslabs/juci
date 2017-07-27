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

	$scope.dev_list = [
		{ label: $tr(gettext("tun")), value: "tun" },
		{ label: $tr(gettext("tap")), value: "tap" }
	];
	$scope.proto_list = [
		{ label: $tr(gettext("udp")), value: "udp" },
		{ label: $tr(gettext("tcp")), value: "tcp" }
	];
	$scope.auth_list = [
		{ label: $tr(gettext("SHA1")), value: "SHA1" },
		{ label: $tr(gettext("none")), value: "none" }
	];
	$scope.cipher_list = [
		{ label: $tr(gettext("DES-CBC")),	value: "DES-CBC" },
		{ label: $tr(gettext("RC2-CBC")),	value: "RC2-CBC" },
		{ label: $tr(gettext("DES-EDE-CBC")),	value: "DES-EDE-CBC" },
		{ label: $tr(gettext("DES-EDE3-CBC")),	value: "DES-EDE3-CBC"},
		{ label: $tr(gettext("DESX-CBC")),	value: "DESX-CBC" },
		{ label: $tr(gettext("BF-CBC")),	value: "BF-CBC" },
		{ label: $tr(gettext("RC2-40-CBC")),	value: "RC2-40-CBC" },
		{ label: $tr(gettext("CAST5-CBC")),	value: "CAST5-CBC" },
		{ label: $tr(gettext("RC2-64-CBC")),	value: "RC2-64-CBC" },
		{ label: $tr(gettext("AES-128-CBC")),	value: "AES-128-CBC" },
		{ label: $tr(gettext("AES-192-CBC")),	value: "AES-192-CBC" },
		{ label: $tr(gettext("AES-256-CBC")),	value: "AES-256-CBC" },
		{ label: $tr(gettext("SEED-CBC")),	value: "SEED-CBC" }
	];
	$scope.verb_list = [
		{ label: $tr(gettext("0")), value: "0" },
		{ label: $tr(gettext("1")), value: "1" },
		{ label: $tr(gettext("2")), value: "2" },
		{ label: $tr(gettext("3")), value: "3" },
		{ label: $tr(gettext("4")), value: "4" },
		{ label: $tr(gettext("5")), value: "5" },
		{ label: $tr(gettext("6")), value: "6" },
		{ label: $tr(gettext("7")), value: "7" },
		{ label: $tr(gettext("8")), value: "8" },
		{ label: $tr(gettext("9")), value: "9" },
		{ label: $tr(gettext("10")), value: "10" },
		{ label: $tr(gettext("11")), value: "11" }
	];
	$scope.ns_cert_type_list = [
		{ label: $tr(gettext("client")), value: "client" },
		{ label: $tr(gettext("server")), value: "server" },
		{ label: $tr(gettext("none")), value: "" }
	];
	$scope.comp_lzo_list = [
		{ label: $tr(gettext("yes")), value: "yes" },
		{ label: $tr(gettext("no")), value: "no" },
		{ label: $tr(gettext("adaptive")), value: "adaptive" }
	];

	$scope.showPassword = true;
	$scope.togglePassword = function(){
		$scope.showPassword = !$scope.showPassword;
	}

	$scope.resolv_retry_infinite = true;
	$scope.toggle_resolv_retry_infinite = function(){
		$scope.resolv_retry_infinite = !$scope.resolv_retry_infinite;
	}

	$uci.$sync("openvpn").done(function(res){
		$scope.openvpn = $uci.openvpn["@openvpn"][0];
		//$scope.openvpn.config = $scope.openvpn.auth_user.value+$scope.openvpn.auth_user.value;
		console.log($scope.openvpn);
	}
	);

});
