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
.controller("wirelessDevicesPage", function($tr, gettext, $scope, $uci, $wireless, $rpc, $juciAlert){
	var show_button = true;
	JUCI.interval.repeat("update-radios-information", 5000, function(done){
		$wireless.getDevices().done(function(devices){
			$scope.devices = devices.map(function(dev){
				if(!dev || !dev.$info)
					return dev;
				dev.$statusList = [
					{ label: $tr(gettext("Bandwidth")), value: dev.$info.bandwidth || $tr(gettext("N/A")) },
					{ label: $tr(gettext("Channel")), value: dev.$info.channel || $tr(gettext("N/A")) },
					{ label: $tr(gettext("Noise")), value: dev.$info.noise + $tr(gettext("dBm")) || $tr(gettext("N/A")) },
					{ label: $tr(gettext("Rate")), value: dev.$info.rate || $tr(gettext("N/A")) },
				];
				set_buttons(dev);
				return dev;
			});
			$scope.$apply();
		}).always(function(){
			done();
		});
	});
	function set_buttons(dev){
		dev.$buttons =  [
			{
				label: (dev.disabled.value) ? $tr(gettext("Enable")) : $tr(gettext("Disable")),
				on_click: function(){dev.disabled.value = !dev.disabled.value; set_buttons(dev);}
			}
		];
		if(show_button){
			if(dev.channel.value !== "auto")
				return;
			dev.$buttons.push({
				label: $tr(gettext("Force Channel Selection")),
				on_click: function(){
					show_button = false;
					set_buttons(dev);
					$rpc.$call("router.wireless", "autochannel", { "radio": dev[".name"] }).done(function(ret){
						if(ret.code === 0 && ret.new_channel)
							$juciAlert($tr(gettext("Force Channel Selection is complete. New channel is")) + " " + ret.new_channel);
						else if(ret.code === 0)
							$juciAlert($tr(gettext("Force Channel Selection is complete.")));
						else if(dev.$info && dev.$info.channel >= 52)
							$juciAlert($tr(gettext("Force Channel Selection has failed because the radio is operating at DFS channel.")));
						else
							$juciAlert($tr(gettext("Force Channel Selection has failed.")));
					}).fail(function(e){
						console.log(e);
					}).always(function(){
						show_button = true;
						set_buttons(dev);
					});
				}
			})
		}
	}
});
