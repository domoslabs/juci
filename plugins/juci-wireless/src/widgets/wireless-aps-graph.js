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
.directive("wirelessApsGraph", function(){
	return {
		templateUrl: "/widgets/wireless-aps-graph.html",
		scope: {
			scan_list: "=ngModel",
			showSsid: "="
		},
		controller: "wirelessApsGraph",
		replace: true
	};
}).controller("wirelessApsGraph", function($scope, $tr, gettext){
	var container = document.getElementById('graph');
	var items = [];

	var dataset = new vis.DataSet(items);
	var options = {
		style: 'bar',
		barChart: {
			align: 'right', // left, center, right
			width: 25,
		},
		dataAxis: {
			left: {
				format: function format(value) {
					return value;
				},
				range: { min: 0, max: 110 },
				title: { text: $tr(gettext("SNR")) }
			},
		},
		drawPoints: {
			onRender: function(item) {
				return item.label != null;
			},
			style: 'circle' // square, circle
		},
		interpolation: {
			enabled: false,
		},
		sampling: false,
		stack: false,
		start: 0,
		end: 100,
		format: {
			minorLabels: {
				second: 'SS',
			},
			majorLabels: {
			}
		},
		showMajorLabels: false,
		moveable: false,
		zoomable: false,
	};

	var groups = new vis.DataSet();
	groups.add({
		id: 1,
		className: 'green',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 1 }
		}
	});
	groups.add({
		id: 2,
		className: 'orange',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 1 }
		}
	});
	groups.add({
		id: 3,
		className: 'red',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 1 }
		}
	});

	var graph2d = new vis.Graph2d(container, dataset, groups, options);

	$scope.$watch("scan_list", function(value){
		if(!value || !value.length) return;

		var minch = 100;
		var maxch = 0;
		var maxsnr = -100;

		value.map(function(val){
			if(minch > val.channel) minch = val.channel;
			if(maxch < val.channel) maxch = val.channel;
			if(maxsnr < val.snr) maxsnr = val.snr;
		});

		options.dataAxis.left.range.max = maxsnr + 10;

		options.min = (minch - 2);
		options.max = (maxch + 2);

		graph2d.setOptions(options);
		dataset.remove(dataset.getIds());
		var i = 0;
		value.map(function(ap){
			if(ap.snr < -10 || ap.snr > 110 || !ap.ssid || ap.channel < 0 || ap.channel > 200)
				return;
			ap["__id__"] = i;
			var group = 1;
			if(ap.snr >= 30) group = 1;
			else if(ap.snr >= 5) group = 2;
			else group = 3;
			dataset.add({ id:i, group: group, x: ap.channel, y: ap.snr, label: { content: "" }});
			i++;
		});
	}, false);
	$scope.$watch("showSsid", function(ap){
		if(!ap || !graph2d) return;
		$scope.scan_list = $scope.scan_list;
		dataset.forEach(function(data){
			if(data.id === ap["__id__"])
				data.label.content = ap.ssid;
			else
				data.label.content = " "; // ugly hack because empty string doesn't work
		});
		graph2d.setItems(dataset);
		graph2d.redraw();
	}, false);
});
