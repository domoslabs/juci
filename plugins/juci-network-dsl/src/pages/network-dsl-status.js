/*
 * Copyright (C) 2019 Iopsys Software Solutions AB. All rights reserved.
 *
 * Author: Jakob Olsson <jakob.olsson@iopsys.eu>
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
.controller("NetworkDslStatusPage", function($scope, $rpc, gettext, $tr){

	function humanize(str) {
		if (!str)
			return;

		var words = str.split('_');
		for (i = 0; i < words.length; i++)
			words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);

		return words.join(' ');
	}

	function upperCase(str) {
		return str.split('_').join(' ').toUpperCase();
	}

	JUCI.interval.repeat("dslstatus", 5000, function(done){
		var stats;

		$rpc.$call("dsl", "stats", {}).done(function (dslstats) {
			stats = dslstats;

			}).done(function() {
				$rpc.$call("dsl", "status", {}).done(function (dslstatus) {
					dslstatus.line.forEach(function (line) {
						$scope.tables = [
							{
								title: $tr(gettext("DSL Status Information")),
								columns: ['', '', ''],
								rows: [
									[
										$tr(gettext("Line Status")),
										"",
										humanize(line.status)
									],
									[
										$tr(gettext("Link Status")),
										"",
										humanize(line.link_status)
									]
								]
							}
						];

						if (line.status === "up") {
							mode = [
								[
									"Operating Mode", "",
									upperCase(line.standard_used),
								]
							]

							if (line.current_profile != undefined && line.current_profile !== "")
								mode.push([
									"VDSL Profile", "",
									humanize(line.current_profile)
								])

							$scope.tables = $scope.tables.concat([
								{
									title: $tr(gettext("DSL Mode")),
									columns: ['', '', ''],
									rows: mode
								},
								{
									title: $tr(gettext("Rates")),
									columns: ['', 'Downstream', 'Upstream'],
									rows: [
										[
											$tr(gettext('Actual Data Rate ')),
											line.channel[0].actndr.ds,
											line.channel[0].actndr.us,
										],
										[
											$tr(gettext('Max Rate')),
											line.max_bit_rate.ds,
											line.max_bit_rate.us
										]
									]
								},
								{
									title: $tr(gettext("Operating Data")),
									columns: ['', 'Downstream', 'Upstream'],
									rows: [
										[
											$tr(gettext('SNR Margin')),
											line.noise_margin.ds / 10,
											line.noise_margin.us / 10
										],
										[
											$tr(gettext('Loop Attenuation')),
											line.attenuation.ds / 10,
											line.attenuation.us / 10
										]
									]
								}
							]);
						}

						stats.line.forEach(function(stats_line) {
							if (stats_line.id != line.id)
								return;

							$scope.tables = $scope.tables.concat(
							[{
								title: $tr(gettext("Error Counter")),
								columns: ['', 'Today', 'Total'],
								rows: [
									[
										$tr(gettext('FEC Errors')),
										stats_line.channel[0].currentday.xtur_fec_errors,
										stats_line.channel[0].total.xtur_fec_errors
									],
									[
										$tr(gettext('CRC Errors')),
										stats_line.channel[0].currentday.xtur_crc_errors,
										stats_line.channel[0].total.xtur_crc_errors
									]
								]
							}
						])
					})
				})
			});
		});
	})
});
