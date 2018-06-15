JUCI.app
.controller("NetworkGFastStatusCtrl", function($scope, $rpc, gettext, $tr){
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
					title: $tr(gettext("Status")),
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
						title: $tr(gettext("Mode")),
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
								$tr(gettext('Rate (Kbps)')),
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
								$tr(gettext('SNR Margin (dB)')),
								dslstats.snr_down,
								dslstats.snr_up
							],
							[
								$tr(gettext('Power (dBm)')),
								dslstats.pwr_down,
								dslstats.pwr_up
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
