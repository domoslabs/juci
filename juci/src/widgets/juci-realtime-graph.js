JUCI.app
.directive("juciRealtimeGraph", function(){
	return {
		scope: {
			tick: "=",
			model: "=ngModel",
			id: "@id",
			ylabel: "=ylabel",
		},
		templateUrl: "/widgets/juci-realtime-graph.html",
		controller: "juciRealtimeGraphCtrl"
	};
})
.controller("juciRealtimeGraphCtrl", function($scope){
	var MAX_DATA_POINTS = 10000;
	var cancelWatcher = $scope.$watch("model",function(model){
		if (!model)
			return;
		if(!$scope.id){
			console.error("juci-realtime-graph: no id defined");
			return;
		}
		if(!$scope.ylabel)
			$scope.ytitle = {};
		else
			$scope.ytitle = { "text": $scope.ylabel };
		if (!$scope.tick)
			$scope.tick = 1000;

		$scope.min = 0;
		$scope.max = 10000;

		$scope.$on("$destroy", function(){
			JUCI.interval.clear("realtimeGraphRenderStep-"+$scope.id);
			JUCI.interval.clear("realtimeGraphAddDataPoint-"+$scope.id);
		});

		startGraph();
		// stop this watch from triggering
		cancelWatcher();
	},false);

	function startGraph() {
		var groups = new vis.DataSet();
		var container = document.getElementById($scope.id);
		var dataset = new vis.DataSet();

		var options = {
			// set the starting zoom to show 30 seconds of data
			start: vis.moment(),
			end: vis.moment().add(30, "seconds"),
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
			interpolation: false,
			legend: true
		};
		// create a graph2d with an (currently empty) dataset
		var graph2d = new vis.Graph2d(container, dataset, groups, options);
		var diff = $scope.tick;

		JUCI.interval.repeat("realtimeGraphAddDataPoint-"+$scope.id,1000,function(next){
			if (diff > $scope.tick){
				diff = 0;
				addDataPoint();
			}
			renderStep();
			diff += 1000;
			next();
		});

		function renderStep() {
			// move the window (you can think of different strategies).
			var now = vis.moment();
			var currentTime = Date.now();
			var range = graph2d.getWindow();
			var interval = range.end - range.start;
			var nodes = dataset.get();
			if (nodes.length == 0)
				return;
			var lastNode = nodes[nodes.length-1];
			if (lastNode == undefined)
				return;
			var lastMoment = lastNode.x;
			if (lastMoment.getTime() - range.end.getTime() < 0)
				return;
			// continuously move the window
			graph2d.setWindow(now - interval, now, {animation: false});
		}

		// Add a new datapoint to the graph
		function addDataPoint() {
			if (!$scope.model) {
				console.log("WARNING: realtime-graph with id " +
						$scope.id + "has no model");
				return -1;
			}
			// add a new data point to the dataset
			var now = vis.moment();
			var i = 0;
			Object.keys($scope.model).forEach(function(key){
				var newY = $scope.model[key];
				if(dataset.length > MAX_DATA_POINTS) {
					var num = (dataset.length - MAX_DATA_POINTS) + (MAX_DATA_POINTS * 0.05)
					var to_remove = data.splice(0, num);
					dataset.remove(to_remove);
				}
				addData(now, newY, i++, key);
			});
			function addData(x, y, group, key){
				var match = groups.get({
					filter:function(item){
						return item.id == group;
					}
				});
				if (match.length == 0) {
					groups.add({
						id: group,
						content: key
					});
				}
				dataset.add({
					x:x,
					y:y,
					group:group
				});
			}

			function round_number(num){
				var pow = Math.round(Math.log10(num));
				var power = Math.pow(10, pow - 1);
				return Math.round(num / power) * power;
			}
			// update y-axis so all datapoints are visible
			var maxData = dataset.max("y");
			var maxAxis = options.dataAxis.left.range.max;
			var minAxis = options.dataAxis.left.range.min;
			if (!maxData)
				return;

			// rescale y-axis when values are too high or too low
			var niceAxis = Math.round(maxData.y/0.7);
			if (niceAxis > 10)
				niceAxis = round_number(niceAxis);
			else if (niceAxis < 1)
				niceAxis = 1;

			var new_options = {
				dataAxis: {
					left: {
						range: {}
					}
				}
			};

			if (maxData.y > maxAxis || maxData.y < maxAxis/10 )
				new_options.dataAxis.left.range.max = niceAxis;
			else
				return;

			graph2d.setOptions(new_options);
		}
	}
});
