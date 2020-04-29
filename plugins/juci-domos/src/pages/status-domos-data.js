
JUCI.app
.controller("StatusDomosData", function($scope, $rpc, $uci, $tr, gettext, $events, $timeout){
	$scope.text = "Hello there";
	$scope.id = "domos-graph";
	$scope.min = 0;
	$scope.ytitle = { "text": "usage (%)"};
	$scope.data = {
		testText: 'Hi There'
	};
	$scope.tick = 1000;
	$scope.enabled = false;
	$scope.devices = {"aa":"aavalue", "bb":"bbvalue"};
	$scope.$on("$destroy", function(){
		JUCI.interval.clear("domosRenderStep-"+$scope.id);
		JUCI.interval.clear("domosAddDataPoint-"+$scope.id);
	});

	// $scope.init = function(){
	// }
	
	// $timeout($scope.init,200);
	
	startGraph();
	
	function startGraph() {
		var chartChanim = {
			idcounter: 1,
			groups: new vis.DataSet(),
			container: document.getElementById($scope.id),
			dataset: new vis.DataSet()
		}
		var chartLatency = {
			idcounter: 1,
			groups: new vis.DataSet(),
			container: document.getElementById('device-latency'),
			dataset: new vis.DataSet()
		}
		var chartRate = {
			idcounter: 1,
			groups: new vis.DataSet(),
			container: document.getElementById('device-rate'),
			dataset: new vis.DataSet()
		}

		var options = {
			// set the starting zoom to show 30 seconds of data
			start: vis.moment().add(-600, "seconds"),
			end: vis.moment().add(100, "seconds"),
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


		addGroup(chartChanim,"tx(%)");
		addGroup(chartChanim,"txop(%)");
		addGroup(chartChanim,"obss(%)");

		var now = vis.moment();

		var graph2d = new vis.Graph2d(chartChanim.container, chartChanim.dataset, chartChanim.groups, options);
		options.dataAxis.left.title = { "text": "latency (ms)"};
		var graph2d = new vis.Graph2d(chartLatency.container, chartLatency.dataset, chartLatency.groups, options);
		options.dataAxis.left.title = { "text": "rate (kbps)"};
		var graph2d = new vis.Graph2d(chartRate.container, chartRate.dataset, chartRate.groups, options);
		
		var diff = 1000;
		// JUCI.interval.repeat("realtimeGraphAddDataPoint-"+$scope.id,10000,function(next){
				diff = 0;
				$rpc.$call("file", "read", {"path":"/tmp/fpingdq2-samples.csv"})
				.done(function(res){
					$scope.info = res;
					var csvdata = parseCSV(res.data);
					console.log(csvdata);
					var epochindex = GetIndexFromCollName("Time",csvdata.header);
					var latencyIndex = GetIndexFromCollName("NwRTD",csvdata.header);
					var txIndex = GetIndexFromCollName("tx",csvdata.header);
					var txopIndex = GetIndexFromCollName("tx",csvdata.header);
					var obssIndex = GetIndexFromCollName("obss",csvdata.header);
					var macIndex = GetIndexFromCollName("mac",csvdata.header);
					var rateIndex = GetIndexFromCollName("rate_of_last_tx_pkt",csvdata.header);
					csvPerDevice = splitCsvOnColumn(csvdata,macIndex);

					var firstdataset = csvPerDevice[Object.keys(csvPerDevice)[0]];
					var start = 0;
					if(chartChanim.dataset.length > 0){
						start = firstdataset.length-2;
					}
					for(var i = start; i<firstdataset.length; i++){
						var csvdatarow = firstdataset[i];
						var date = vis.moment(csvdatarow[epochindex]/1000);
						addDataPoint(chartChanim.dataset,date,csvdatarow[txIndex],1);
						addDataPoint(chartChanim.dataset,date,csvdatarow[txopIndex],2);
						addDataPoint(chartChanim.dataset,date,csvdatarow[obssIndex],3);
					}

					var addall = true;
					for(const prop in csvPerDevice){
						if(!groupContains(chartLatency.groups._data,prop)){
							addGroup(chartLatency,prop);
						}
						var latencygroupid = getGroupID(chartLatency.groups._data,prop);

						if(!groupContains(chartRate.groups._data,prop)){
							addGroup(chartRate,prop);
						}
						var rategroupid = getGroupID(chartRate.groups._data,prop);

						var csvdev = csvPerDevice[prop];
						var start = 0;
						if(!addall && chartChanim.dataset.length > 0){
							start = csvdev.length-2;
						}
						for(var i = start; i<csvdev.length; i++){
							var csvdatarow = csvdev[i];
							var date = vis.moment(csvdatarow[epochindex]/1000);
							addDataPoint(chartLatency.dataset, date,csvdatarow[latencyIndex],latencygroupid);
							addDataPoint(chartRate.dataset, date,csvdatarow[rateIndex],rategroupid);
						}
					}
					addall = false;
				}).fail(function(){
					$scope.info = "FAILED";
				});
			diff += 1000;
			// next();
		// });

		function addGroup(chartdata, groupname){
			chartdata.groups.add({
				id: chartdata.idcounter++,
				content: groupname
			});
		}

		function getGroupID(groups, groupName){
			var found = false;
			for(var prop in groups) {
				if (groups[prop].content == groupName) {
					return groups[prop].id;
				}
			}
			return -1;
		}
		function groupContains(groups, groupName){
			var found = false;
			for(var prop in groups) {
				if (groups[prop].content == groupName) {
					found = true;
					break;
				}
			}
			return found;
		}

		function parseCSV(csvstring){
			var lines = csvstring.split("\n");
			var header = lines[0].split(",");
			if(lines[0].includes("chanspec")){

			}
			csvdata = {};
			csvdata.header=header;
			csvdata.data = [];
			for(var i = 1; i<lines.length; i++){
				var csvdataline = lines[i].split(",");
				csvdata.data.push(csvdataline)
			}
			return csvdata;
		}
		
		function splitCsvOnColumn(csvdata, collindex){

			splitted = {};
			for(var i = 0; i<csvdata.data.length; i++){
				var keyField = csvdata.data[i][collindex];
				if(keyField === undefined){
					continue;
				}
				if(!(keyField in splitted)){
					splitted[keyField] = [];
				}
				splitted[keyField].push(csvdata.data[i]);
			}
			return splitted;
		}


		function addDataPoint(datasetadd, xdata,ydata,group){
			datasetadd.add({
				x:xdata,
				y:ydata,
				group:group
			});
		}

		function GetIndexFromCollName(collname, headerArray){
			for(var i = 0; i<headerArray.length; i++){
				if(headerArray[i] == collname){
					return i;
				}
			}
			return -1;
		}
	}

});


