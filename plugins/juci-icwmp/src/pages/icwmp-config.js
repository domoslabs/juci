/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.controller("icwmpConfigPage", function($scope, $rpc, $uci, $tr, gettext, $firewall, $juciAlert){
	$uci.$sync(["cwmp"]).done(function(){
		$scope.acs = $uci.cwmp.acs;
		$scope.cpe = $uci.cwmp.cpe;
		$scope.$apply();
	});
	$firewall.getZoneNetworks("wan").done(function(networks){
		$scope.wan_interfaces = networks.map(function(n){
			return { label: String(n[".name"]).toUpperCase(), value: n[".name"] };
		});
		$scope.$apply();
	});
	$scope.bool = [
		{ label: $tr(gettext("Enabled")), 	value: 'enable' },
		{ label: $tr(gettext("Disabled")),	value: 'disable' }
	];
	$scope.severity_levels = [
		{ label: $tr(gettext("Emergency")),	value: 'EMERG' },
		{ label: $tr(gettext("Alert")),		value: 'ALERT' },
		{ label: $tr(gettext("Critical")),	value: 'CRITIC' },
		{ label: $tr(gettext("Error")),		value: 'ERROR' },
		{ label: $tr(gettext("Warning")),	value: 'WARNING' },
		{ label: $tr(gettext("Notice")),	value: 'NOTICE' },
		{ label: $tr(gettext("Info")),		value: 'INFO' },
		{ label: $tr(gettext("Debug")),		value: 'DEBUG' }
	];

	$scope.status = [];

	$scope.onTR069ObjectAvailable=$rpc.$has("tr069", "inform");
	JUCI.interval.repeat("icwmp-status-update", 5000, function(next){
		function reload_status(){
			$rpc.$call("tr069", "status").done(function(data){
				if(!data) return;
				if(data.cwmp){
					$scope.status.push({
						title: $tr(gettext("CWMP")),
						rows: [
							[$tr(gettext("Status")), data.cwmp.status],
							[$tr(gettext("Start Time")), data.cwmp.start_time],
							[$tr(gettext("ACS URL")), data.cwmp.acs_url]
						]
					});
				}
				if(data.last_session){
					$scope.status.push({
						title: $tr(gettext("Last Session")),
						rows: [
							[$tr(gettext("Status")), data.last_session.status],
							[$tr(gettext("Start Time")), data.last_session.start_time],
							[$tr(gettext("End Time")), data.last_session.end_time]
						]
					});
				}
				if(data.next_session){
					$scope.status.push({
						title: $tr(gettext("Next Session")),
						rows: [
							[$tr(gettext("Status")), data.next_session.status],
							[$tr(gettext("Start Time")), data.next_session.start_time],
							[$tr(gettext("End Time")), data.next_session.end_time]
						]
					});
				}
				if(data.statistics){
					$scope.status.push({
						title: $tr(gettext("Statistics")),
						rows: [
							[$tr(gettext("Successful Sessions")), data.statistics.success_sessions],
							[$tr(gettext("Failed Sessions")), data.statistics.failure_sessions],
							[$tr(gettext("Total Sessions")), data.statistics.total_sessions]
						]
					});
				}
			}).fail(function(e){
				$scope.status = [];
			}).always(function(){
				$scope.$apply();
				next();
			});
		}
		if($rpc.$has("tr069", "status")) {
			reload_status();
		} else {
			// $isConnected will add any new ubus object that was not there when page was loaded
			$rpc.$isConnected().always(function(){
				reload_status();
			});
		}
	});

	$scope.statusAvailable = function(){ return $scope.status.length; };

	$scope.contactACS = function() {
		$rpc.$call("tr069", "inform", {"event":"connection request"}).done(function(data){
			if(data.status === 1)
				$juciAlert($tr(gettext("Connection request sent")));
		}).fail(function(e){
			console.error("couldn't call tr069 inform " + e);
		});
	}
});

