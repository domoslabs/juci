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
.controller("wirelessStatusPage", function($scope, $uci, $wireless, gettext, $rpc, $tr, gettext){
	$scope.radios = [];
	$scope.interfaces = [];
	$scope.clients = [];

	$scope.translate = {
		"none" : $tr(gettext("None")),
		"wep" : $tr(gettext("WEP")),
		"psk2" : $tr(gettext("WPA2 Personal (PSK)")),
		"psk" : $tr(gettext("WPA Personal (PSK)")),
		"mixed-psk" : $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode")),
		"wpa2" : $tr(gettext("WPA2 Enterprise")),
		"wpa" : $tr(gettext("WPA Enterprise")),
		"wpa-mixed" : $tr(gettext("WPA/WPA2 Enterprise Mixed Mode"))
	};

	JUCI.interval.repeat("wifi-status-page",5000,function(next){
		async.series([
			function(next){
				$rpc.router.radios().done(function(rds){
					$scope.radios = Object.keys(rds).map(function(r){
						var radio = rds[r];
						radio[".name"] = r;
						return radio;
					});
					$scope.radios.map(function(radio){ radio[".interfaces"] = []; });
				})
				.always(function(){ next(); });
			},
			function(next){
				$wireless.getInterfaces().done(function(ifs){
					$scope.interfaces = ifs;
					$scope.interfaces.map(function(i){ i[".clients"] = []; });
				})
				.always(function(){ next(); });
			},
			function(next){
				$wireless.getConnectedClients().done(function(cls){
					$scope.clients = cls;
					cls.map( function(c){
						c["rows"] = [
							[$tr(gettext("IP-Address")),c.ipaddr],
							[$tr(gettext("MAC-Address")), String(c.macaddr).toUpperCase()],
							[$tr(gettext("DHCP")), c.dhcp],
							[$tr(gettext("Idle")), c.idle],
							[$tr(gettext("In Network")), c.in_network],
							[$tr(gettext("RSSI")), c.rssi+" dBm"],
							[$tr(gettext("SNR")), c.snr+ " dBm"],
							[$tr(gettext("TX Bytes")), c.tx_bytes],
							[$tr(gettext("RX Bytes")), c.rx_bytes],
							[$tr(gettext("TX Rate")), c.tx_rate],
							[$tr(gettext("RX Rate")), c.rx_rate]
						];
					});
					console.log($scope.clients);
				})
				.always(function(){ next(); });
			}],
			function(){
				// Add clients to interfaces
				$scope.clients.map(function(client){
					var iface = $scope.interfaces.find(function(i){
						return i["ifname"]["value"] === client["wdev"];
					});
					iface[".clients"].push(client);
				});
				//Add interfaces to radios
				$scope.interfaces.map(function(iface){
					var radio = $scope.radios.find(function(r){
						return r[".name"] === iface["device"]["value"];
					});
					radio[".interfaces"].push(iface);
				});
				$scope.$apply();
				next();
			}
		);
	}); 
}); 
