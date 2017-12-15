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
.controller("PageBroadcomDslStatus", function($scope, $rpc, gettext, $tr){
	JUCI.interval.repeat("dslstatus", 5000, function(done){
		$rpc.$call("router.dsl", "stats", {}).done(function(dslstats){
			var dslstats = dslstats.dslstats;

			// compute floating point values (because ubus blobs do not support floats yet)
			function reconstruct_floats(obj) {
				for (var property in obj) {
					if (!obj.hasOwnProperty(property))
						return;
					if (typeof obj[property] === "object") {
						reconstruct_floats(obj[property]);
					} else {
						var matches = property.match(/(.*)_x([\d]*)/);
						if(matches && matches.length === 3){
							obj[matches[1]] = parseFloat(String(obj[property])) /
								parseFloat(matches[2]);
						}
					}
				}
			}
			reconstruct_floats(dslstats);

			$scope.tables = [
				{
					title: $tr(gettext("DSL Status Information")),
					columns: [ '', '', 'Current' ],
					rows: [
						[
							$tr(gettext("Line Status")),
							"",
							dslstats.status
						]
					]
				}
			];
			if(dslstats.status === "Showtime"){
				$scope.tables = $scope.tables.concat([
					{
						title: $tr(gettext("DSL Mode")),
						columns: ["", "", "Current"],
						rows: [
							[
								dslstats.mode, "",
								dslstats.traffic
							]
						]
					},
					{
						title: $tr(gettext("Bit Rate")),
						columns: [ '', 'Downstream', 'Upstream' ],
						rows: [
							[
								$tr(gettext('Actual Data Rate')),
								dslstats.bearers[0].rate_down,
								dslstats.bearers[0].rate_up
							]
						]
					},
					{
						title: $tr(gettext("Operating Data")),
						columns: [ '', 'Downstream', 'Upstream' ],
						rows: [
							[
								$tr(gettext('SNR Margin')),
								dslstats.snr_down,
								dslstats.snr_up
							],
							[
								$tr(gettext('Loop Attenuation')),
								dslstats.attn_down,
								dslstats.attn_up
							]
						]
					},
					{
						title: $tr(gettext("Error Counter")),
						columns: [ '', 'Downstream', 'Upstream' ],
						rows: [
							[
								$tr(gettext('FEC Corrections')),
								dslstats.counters.totals.fec_down,
								dslstats.counters.totals.fec_up
							],
							[
								$tr(gettext('CRC Errors')),
								dslstats.counters.totals.crc_down,
								dslstats.counters.totals.crc_up
							]
						]
					},
					{
						title: $tr(gettext("Cell Statistics")),
						columns: [ '', 'Transmitted', 'Received' ],
						rows: [
							[
								$tr(gettext('Cell Counter')),
								dslstats.bearers[0].total_cells_down,
								dslstats.bearers[0].total_cells_up
							]
						]
					}
				]);
			}
			$scope.$apply();
			done();
		});
	});
});
