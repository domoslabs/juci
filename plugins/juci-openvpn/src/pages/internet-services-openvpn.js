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
.controller("OpenVPNController", function($scope, $tr, gettext, $uci, $rpc){
	$scope.data = {
		ovpn_orig: "",
		ovpn: "",
		changed: false
	};

	$scope.dev_list = [
		{ label: "tun", value: "tun" },
		{ label: "tap", value: "tap" }
	];
	$scope.proto_list = [
		{ label: "udp", value: "udp" },
		{ label: "tcp", value: "tcp" }
	];
	$scope.auth_list = [
		{ label: "SHA1", value: "SHA1" },
		{ label: "none", value: "none" }
	];
	$scope.cipher_list = [
		{ label: "DES-CBC",	value: "DES-CBC" },
		{ label: "RC2-CBC",	value: "RC2-CBC" },
		{ label: "DES-EDE-CBC",	value: "DES-EDE-CBC" },
		{ label: "DES-EDE3-CBC",value: "DES-EDE3-CBC"},
		{ label: "DESX-CBC",	value: "DESX-CBC" },
		{ label: "BF-CBC",	value: "BF-CBC" },
		{ label: "RC2-40-CBC",	value: "RC2-40-CBC" },
		{ label: "CAST5-CBC",	value: "CAST5-CBC" },
		{ label: "RC2-64-CBC",	value: "RC2-64-CBC" },
		{ label: "AES-128-CBC",	value: "AES-128-CBC" },
		{ label: "AES-192-CBC",	value: "AES-192-CBC" },
		{ label: "AES-256-CBC",	value: "AES-256-CBC" },
		{ label: "SEED-CBC",	value: "SEED-CBC" }
	];
	$scope.verb_list = [
		{ label: "0", value: "0" },
		{ label: "1", value: "1" },
		{ label: "2", value: "2" },
		{ label: "3", value: "3" },
		{ label: "4", value: "4" },
		{ label: "5", value: "5" },
		{ label: "6", value: "6" },
		{ label: "7", value: "7" },
		{ label: "8", value: "8" },
		{ label: "9", value: "9" },
		{ label: "10", value: "10" },
		{ label: "11", value: "11" }
	];
	$scope.ns_cert_type_list = [
		{ label: $tr(gettext("Client")), value: "client" },
		{ label: $tr(gettext("Server")), value: "server" },
		{ label: $tr(gettext("None")), value: "" }
	];
	$scope.comp_lzo_list = [
		{ label: $tr(gettext("Yes")), value: "yes" },
		{ label: $tr(gettext("No")), value: "no" },
		{ label: $tr(gettext("Adaptive")), value: "adaptive" }
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
		//console.log($scope.openvpn);

	}
	);

	$rpc.$call("juci.openvpn", "get_config", {}).done(function(data){
		if (data.result)
			$scope.data.ovpn_orig = $scope.data.ovpn = data.result;
		$scope.data.changed = false;
		$scope.$apply();
	});

	$scope.$watch("data.ovpn", function(){
		$scope.data.changed = !($scope.data.ovpn_orig === $scope.data.ovpn);

	});

	$scope.save_config = function(){
		$rpc.$call("juci.openvpn", "set_config", {"data":$scope.data.ovpn}).done(function(data){
			$scope.data.ovpn_orig = $scope.data.ovpn;
			$scope.data.changed = false;
			$scope.$apply();
			$rpc.$call("uci", "commit", {"config":"openvpn"});
		}).fail(function(error){
			console.log("Failed to call juci.openvpn set_config "+error);
		});
	};

});
