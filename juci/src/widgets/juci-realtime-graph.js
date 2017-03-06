JUCI.app
.directive("juciRealtimeGraph", function(){
	return {
		scope: {
			model: "=ngModel",
			id: "@id",
			tick: "=tick",
			min: "@min",
			max: "@max",
			ylabel: "@ylabel",
		}, 
		templateUrl: "/widgets/juci-realtime-graph.html",
		//template: '<div id={{id}}></div>',
		controller: "juciRealtimeGraphCtrl"
	}; 
})
.controller("juciRealtimeGraphCtrl", function($scope){
	$scope.$watch("id",function(){ // expected to run only once, at startup
		if(!$scope.id){return;}

		if(!$scope.tick){ $scope.tick = 1000; }
		if(!$scope.min){ $scope.min = 0; } else{ $scope.min = parseInt($scope.min); }
		if(!$scope.max){ $scope.max = 10000; } else{ $scope.max = parseInt($scope.max); }
		if(!$scope.ylabel){ $scope.ytitle = {}; } else{ $scope.ytitle = { "text": $scope.ylabel }; }

		$scope.$on("$destroy", function(){
			JUCI.interval.clear("realtimeGraphRenderStep-"+$scope.id);
			JUCI.interval.clear("realtimeGraphAddDataPoint-"+$scope.id);
		});

		var DELAY = $scope.tick; // delay[ms] to add new data points
		var groups = new vis.DataSet();
		var names = Object.keys($scope.model);
		for(var i=0; i<names.length; i++){
			groups.add({ id:i, content:names[i] });
		}

		// create a graph2d with an (currently empty) dataset
		var container = document.getElementById($scope.id);
		//container.innerHTML = container.innerHTML + $scope.id;
		var dataset = new vis.DataSet();

		var options = {
			start: vis.moment().add(-30, 'seconds'), // changed so its faster
			end: vis.moment(),
			dataAxis: {
				left: {
					range: { min:$scope.min, max:$scope.max },
					title: $scope.ytitle
				}
			},
			drawPoints: {
				style: 'circle' // square, circle
			},
			shaded: {
				orientation: 'bottom' // top, bottom
			},
			drawPoints: false,
			legend: true
		};
		var graph2d = new vis.Graph2d(container, dataset, groups, options);

		function renderStep() {
			// move the window (you can think of different strategies).
			var now = vis.moment();
			var range = graph2d.getWindow();
			var interval = range.end - range.start;
			// continuously move the window
			graph2d.setWindow(now - interval, now, {animation: false});
		}

		// Add a new datapoint to the graph
		function addDataPoint() {
			// add a new data point to the dataset
			var now = vis.moment();
			var datatypes = Object.keys($scope.model);
			for(var i=0; i<datatypes.length; i++){
				dataset.add({
					x: now,
					y: $scope.model[datatypes[i]],
					group: i
				});
			}

			// remove all data points which are no longer visible
			var range = graph2d.getWindow();
			var interval = range.end - range.start;
			var oldIds = dataset.getIds({
				filter: function (item) {
					return item.x < range.start - interval;
				}
			});
			dataset.remove(oldIds);

			// update y-axis so all datapoints are visible
			var maxData = dataset.max("y")["y"];
			var maxAxis = options.dataAxis.left.range.max;
			var minData = dataset.min("y")["y"];
			var minAxis = options.dataAxis.left.range.min;

			if(maxData > maxAxis){ options.dataAxis.left.range.max = maxData + 1 }
			if(minData < minAxis){ options.dataAxis.left.range.min = minData - 1 }
			graph2d.setOptions(options);

		}

		JUCI.interval.repeat("realtimeGraphRenderStep-"+$scope.id,60,function(next){
			renderStep();
			next();
		});
		JUCI.interval.repeat("realtimeGraphAddDataPoint-"+$scope.id,$scope.tick,function(next){
			addDataPoint();
			renderStep(); //removes ugly blinks when the datapoints are updated
			next();
		});

	},true);
}); 
