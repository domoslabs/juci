
JUCI.app
.controller("StatusDomos", function($scope, $rpc, $tr, gettext, $events){
	$scope.text = "Hello there";
	$scope.id = "domos-graph";
	$scope.min = 0;
	$scope.ytitle = { "text": "Latency (ms)"};
	$scope.data = {
		testText: 'Hi There'
	};
	$scope.tick = 1000;
	
	$scope.$on("$destroy", function(){
		JUCI.interval.clear("domosRenderStep-"+$scope.id);
		JUCI.interval.clear("domosAddDataPoint-"+$scope.id);
	});

	startGraph();

	function startGraph() {
		var groups = new vis.DataSet();
		var container = document.getElementById($scope.id);
		var dataset = new vis.DataSet();

		var options = {
			// set the starting zoom to show 30 seconds of data
			start: vis.moment().add(-600, "seconds"),
			end: vis.moment().add(300, "seconds"),
			dataAxis: {
				left: {
					format: function (value) {
						var dec = 0;
						if(value < 100) dec = 1;
						if(value < 10) dec = 2;
						return ''+value.toFixed(dec);
					},
					range: { min:$scope.min },
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
		groups.add({
			id: 1,
			content: "Latency"
		});
		groups.add({
			id: 2,
			content: "txop(%)"
		});
		groups.add({
			id: 3,
			content: "obss(%)"
		});
		var now = vis.moment();
		
		var graph2d = new vis.Graph2d(container, dataset, groups, options);

		var diff = 1000;
		JUCI.interval.repeat("realtimeGraphAddDataPoint-"+$scope.id,10000,function(next){
				diff = 0;
				$rpc.$call("file", "read", {"path":"/tmp/fpingdq2-samples.csv"})
				.done(function(res){
					$scope.info = res;
					var data = res.data;
					var lines = data.split("\n");
					// console.log(data);
					var start = 0;
					if(dataset.length>0){
						// console.log("Datapoints: " + dataset.length);
						start = lines.length-2;
					}
					for(var i = start; i<lines.length; i++){
						var csvdata = lines[i].split(",");
						if(csvdata.length > 20){
							// console.log("Epooch: " + csvdata[54]);
							var date = vis.moment(csvdata[54]/1000);
							var latency = csvdata[57];
							// console.log(date + " " + latency);
							if(csvdata[59] == 1){
								addDataPoint(date,latency,1);
								addDataPoint(date,csvdata[1],2);
								addDataPoint(date,csvdata[3],3);
							}
						}
					}
				}).fail(function(){
					$scope.info = "FAILED";
				});
			diff += 1000;
			next();
		});

		

		function addDataPoint(xdata,ydata,group){
			dataset.add({
				x:xdata,
				y:ydata,
				group:group
			});
			// console.log(dataset);
		}
	}

});


