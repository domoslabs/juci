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
				$rpc.$call("router.wireless", "radios").done(function(rds){
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
						if(!c.scbstats || !c.rssi_per_antenna){ return; }
						c["rows"] = [
							[$tr(gettext("IP-Address")),c.ipaddr],
							[$tr(gettext("MAC-Address")), String(c.macaddr).toUpperCase()],
							[$tr(gettext("DHCP")), c.dhcp],
							[$tr(gettext("Idle")), c.idle],
							[$tr(gettext("In Network")), c.in_network],
							[$tr(gettext("RSSI")), c.rssi+" dBm"],
							[$tr(gettext("SNR")), c.snr+ " dB"],
							[$tr(gettext("Number of Antennas")), c.rssi_per_antenna.length],
							[$tr(gettext("TX Rate")), parseInt(c.scbstats.rate_of_last_tx_pkt/1000 +0.5) + " Mbps"],
							[$tr(gettext("RX Rate")), parseInt(c.scbstats.rate_of_last_rx_pkt/1000 +0.5) + " Mbps"],
						];



						var flagsString = "";
						for (var attrname in c.flags){
							if(c.flags[attrname] !== false){
								flagsString = flagsString + attrname+", ";
							}
						}
						if(flagsString != "" ){ c["rows"].push([$tr(gettext("Flags")),flagsString.slice(0,-2).toUpperCase()]); }
						
						var htcapsString= "";
						for (var attrname in c.htcaps){
							if(c.htcaps[attrname] !== false){
								htcapsString = htcapsString + attrname+", ";
							}
						}
						if(htcapsString != "" ){ c["rows"].push([$tr(gettext("802.11n Capabilities")),htcapsString.slice(0,-2).toUpperCase()]); }

						var vhtcapsString= "";
						for (var attrname in c.vhtcaps){
							if(c.vhtcaps[attrname] !== false){
								vhtcapsString = vhtcapsString + attrname+", ";
							}
						}
						if(vhtcapsString != "" ){ c["rows"].push([$tr(gettext("802.11ac Capabilities")),vhtcapsString.slice(0,-2).toUpperCase()]); }



						var most_of_scbstat= [
							[$tr(gettext("TX Total Packets")), c.scbstats.tx_total_pkts],
							[$tr(gettext("Unicast Packets")), c.scbstats.tx_ucast_pkts],
							[$tr(gettext("TX Unicast Packets")), c.scbstats.tx_ucast_pkts],
							[$tr(gettext("TX Multicast/Broadcast Packets")), c.scbstats.tx_mcast_bcast_pkts],
							[$tr(gettext("TX Failures")), c.scbstats.tx_failures],
							[$tr(gettext("RX Data Packets")), c.scbstats.rx_data_pkts],
							[$tr(gettext("RX Unicast Packets")), c.scbstats.rx_ucast_pkts],
							[$tr(gettext("RX Multicast/Broadcast Packets")), c.scbstats.rx_mcast_bcast_pkts],
							[$tr(gettext("TX Data Packets Retried")), c.scbstats.tx_data_pkts_retried],
							[$tr(gettext("TX Total Packets Sent")), c.scbstats.tx_total_pkts_sent],
							[$tr(gettext("TX Packets Retries")), c.scbstats.tx_pkts_retries],
							[$tr(gettext("TX Packets Retry Exhausted")), c.scbstats.tx_pkts_retry_exhausted],
							[$tr(gettext("RX Total Packets Retried")), c.scbstats.rx_total_pkts_retried],
						];
						most_of_scbstat.map(function(r){ c["rows"].push(r); });
						
					});
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
