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
		if(!$scope.id){console.error("juci-realtime-graph: no id defined"); return;}
		if(!$scope.tick){ $scope.tick = 1000; }
		if(!$scope.ylabel){ $scope.ytitle = {}; } else{ $scope.ytitle = { "text": $scope.ylabel }; }
		$scope.min = 0;
		$scope.max = 10000;

		$scope.$on("$destroy", function(){
			JUCI.interval.clear("realtimeGraphRenderStep-"+$scope.id);
			JUCI.interval.clear("realtimeGraphAddDataPoint-"+$scope.id);
		});

		//wait until model is defined before starting
		setTimeout(startGraph, 500); //TODO: do something better
	},true);

	function startGraph() {
		if(!$scope.model){console.error("juci-realtime-graph: no ngModel defined"); return;};

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
					return range.end - item.x > interval*1.10; //datapoints are removed when 10% outside of window interval
				}
			});
			dataset.remove(oldIds);

			// update y-axis so all datapoints are visible
			var maxData = dataset.max("y")["y"];
			var maxAxis = options.dataAxis.left.range.max;
			var minData = dataset.min("y")["y"];
			var minAxis = options.dataAxis.left.range.min;

			// rescale y-axis when values are too high or too low
			var niceAxis = Math.round(maxData/0.7);
			if (maxData > maxAxis) {
				options.dataAxis.left.range.max = maxAxis>1000 ? Math.round(niceAxis/1000)*1000 : niceAxis;
			}
			else if (maxData < maxAxis/10 ) {
				options.dataAxis.left.range.max = niceAxis>0 ? niceAxis : 1;
			}

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
	}
}); 
