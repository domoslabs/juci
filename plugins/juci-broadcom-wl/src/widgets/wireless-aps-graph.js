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
.directive("wirelessApsGraph", function($compile, $parse){
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
		start: 0,
		end: 20,
		style: 'bar',
		drawPoints: {
			onRender: function(item, group, grap2d) {
				return item.label != null;
			},
			style: 'circle'
		}
	};
	
	var groups = new vis.DataSet(); 	
	groups.add({
		id: 1,
		className: 'green',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});
	groups.add({
		id: 2,
		className: 'orange',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});
	groups.add({
		id: 3,
		className: 'red',
		options: {
			style:'bar',
			drawPoints: { style: 'circle', size: 10 }
		}
	});

	var graph2d = new vis.Graph2d(container, dataset, groups, options);

	$scope.$watch("scan_list", function(value){
		if(!value) return; 		
	
		dataset.remove(dataset.getIds()); 
		value.map(function(ap){
			var group = 1; 
			if(ap.snr < 20) group = 3; 
			else if(ap.snr < 60) group = 2; 
			else group = 1; 
			dataset.add({group: group, x: ap.channel, y: String(ap.snr), label: { content: ap.ssid }}); 
		}); 
	}); 
}); 
