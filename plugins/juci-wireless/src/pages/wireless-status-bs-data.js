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
.controller("wirelessStatusBsDataPage", function($scope, $wireless, $rpc){
	$scope.update = function(){
		$wireless.getInterfaces().done(function(ifs){
			if(!ifs || !ifs.length)
				return;
			async.each(ifs, function(iface, next){
				$rpc.$call("wifi.bsd", "bs_data", { "vif":iface.ifname.value }).done(function(res){
					if(!res || !res.stations || ! res.stations instanceof Array)
						return;
					iface.bs_data = res.stations;
				}).fail(function(e){
					console.log(e);
				}).always(function(){next();});
			}, function(){
				$scope.vifs = ifs;
				$scope.$apply();
			});
		});
	};
	JUCI.interval.repeat("wireless-status-bs-data-update", 1000, function(next){
		$scope.update();
		next();
	});
});
