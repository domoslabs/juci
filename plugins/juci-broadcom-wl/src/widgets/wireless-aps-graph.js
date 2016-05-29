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
			scan_list: "=ngModel"
		}, 
		controller: "wirelessApsGraph", 
		replace: true 
	};
}).controller("wirelessApsGraph", function($scope){
	var	container = document.getElementById('graph');	
	var items = []; 

	var dataset = new vis.DataSet(items);
	var options = {
		yAxisOrientation: 'left',
		defaultGroup: 'default',
		sort: true,
		sampling: true,
		stack: false,
		graphHeight: '400px',
		shaded: {
			enabled: false,
			orientation: 'bottom' // top, bottom
		},
		style: 'bar',
		barChart: {
			width: 25,
			sideBySide: false,
			align: 'right' // left, center, right
		},
		interpolation: {
			enabled: true,
			parametrization: 'centripetal', // uniform (alpha = 0.0), chordal (alpha = 1.0), centripetal (alpha = 0.5)
			alpha: 0.5
		},
		drawPoints: {
//			onRender: function(item) {
//				return item.label != null;
//			},
			enabled: true,
			size: 6,
			style: 'circle' // square, circle
		},
		dataAxis: {
			showMinorLabels: true,
			showMajorLabels: true,
			icons: false,
			width: '40px',
			visible: false,
			alignZeros: true,
			left: {
				range: { min: undefined, max: undefined },
				format: function format(value) {
					return value;
				},
				title: { text: undefined, style: undefined }
			},
			right: {
				range: { min: undefined, max: undefined },
				format: function format(value) {
					return value;
				},
				title: { text: undefined, style: undefined }
			}
		},
		legend: {
			enabled: false,
			icons: true,
			left: {
				visible: true,
				position: 'top-left' // top/bottom - left,right
			},
			right: {
				visible: true,
				position: 'top-right' // top/bottom - left,right
			}
		},
//		groups: {
//			visibility: {}
//		},

		start: 0,
		end: 100,
		min: 0,
		max: 165,
		moveable: false,
		zoomable: false,
		direction: 'horizontal' // 'horizontal' or 'vertical'
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
		if(!value || !value[0]) return;

		var minch;
		var maxch;

		if (parseInt(value[0].channel) >= 36) {
			minch = 36;
			maxch = 165;
		} else {
			minch = 1;
			maxch = 14;
		}

		value.map(function(val){
			min = minch;
			max = maxch;
		});

		options.min = (minch);
		options.max = (maxch);
		options.zoomMin = (minch - 1);
		options.zoomMax = (maxch + 1);
		options.moveable = true;
		options.zoomable = false;

		graph2d.setOptions(options);
		dataset.remove(dataset.getIds()); 
		value.map(function(ap){
			var group = 1;
			if(ap.rssi >= -50) group = 1;
			else if(ap.rssi >= -75) group = 2;
			else group = 3;
			dataset.add({group: group, x: ap.channel, y: (100 + ap.rssi), label: { content: ap.ssid }});
		});
	});
});
