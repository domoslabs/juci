//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config){
	if(!$config || !$config.settings || !$config.settings["@widget"]
				|| !$config.settings["@widget"].length){
		console.log("no widgets in menu");
		$scope.widgets = []; //set it to empty array for backwards compability
	}else{
		$scope.widgets = $config.settings["@widget"].filter(function(widget){
			if(widget.require.value.find(function(req){
				var split = req.split(":");
				if(split[0] !== "ubus"){
					console.log("widgets only support require ubus:object[->method]");
					return true;
				}
				var parts = String(split[1]).split("->");
				if(parts.length !== 1 && parts.length !== 2)return true;
				if(parts.length === 1){
					return !$rpc.$has(parts[0]);
				}else{
					return !$rpc.$has(parts[0], parts[1]);
				}
			})) return false;
			return true;
		});
	}
	function chunk(array, chunkSize) {
		return [].concat.apply([],
			array.map(function(elem,i) {
				return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
			})
		);
	}
	// get normal widgets
	["overview", "overviewStatus", "overviewSlider"].map(function(widget_area){
		var queue = JUCI.app._invokeQueue.filter(function(x){
			return x[1] == "directive" && x[2][0].indexOf(widget_area+"Widget") == 0;
		});
		$scope[widget_area+"Widgets"] = queue.map(function(item){
			var directive = item[2][0];
			if(!$scope.widgets || !$scope.widgets.length){
				return "<"+directive.toDash()+"/>";
			}
			if($scope.widgets.find(function(widget){
				return widget.name.value.find(function(name){
					return name === directive || name == directive.toDash();
				}) !== undefined;
			})) return "<"+directive.toDash()+"/>";
		}).filter(function(x){return x;}).sort();
	});

	var is_to_wide = (window.innerWidth > 92 && window.innerWidth < 1199);
	window.addEventListener("resize", function(){
		var is_to_w = (window.innerWidth > 92 && window.innerWidth < 1199);
		if(is_to_w !== is_to_wide){
			$scope.overviewWidgetRows = chunk($scope.overviewWidgets, is_to_w ? 2 : 3);
			is_to_wide = is_to_w;
			$scope.$apply();
		}
	});
	$scope.overviewWidgetRows = chunk($scope.overviewWidgets, is_to_wide ? 2: 3);
});

JUCI.page("overview", "pages/overview.html");
