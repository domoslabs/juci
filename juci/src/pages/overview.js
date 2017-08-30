//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("OverviewPageCtrl", function($scope, $rpc, $uci, $config){
	function getAccessableWidgets(){
		var self = this;
		var def = $.Deferred();
		var widgets = [];
		if(!$config || !$config.settings || !$config.settings["@widget"]
				|| !$config.settings["@widget"].length)
			return def.reject("no widgets in menu");
		async.eachSeries($config.settings["@widget"], function(widget, cb){
			$rpc.$has_access(widget).done(function(access){
				if(access === true && widget.name && widget.name.value && widget.name.value.length)
					widgets = widgets.concat(widget.name.value);
			}).fail(function(e){
				console.error("invalid section", widget);
			}).always(function(){
				cb();
			});
		}, function(){
			def.resolve(widgets);
		});
		return def.promise();
	}
	function chunk(array, chunkSize) {
		return [].concat.apply([],
			array.map(function(elem,i) {
				return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
			})
		);
	}
	getAccessableWidgets().done(function(widgets){
		// get normal widgets
		["overview", "overviewStatus", "overviewSlider"].map(function(widget_area){
			var queue = JUCI.app._invokeQueue.filter(function(x){
				return x[1] == "directive" && x[2][0].indexOf(widget_area+"Widget") == 0;
			}).map(function(item){
				if(!item instanceof Array || !item[2] instanceof Array || item[2].length == 0)
					return null;
				return item[2][0];
			})
			// filter out the widgets that is not in widgets list
			.filter(function(widget){
				if(widget === null)
					return false;
				found = widgets.find(function(w){
					return w === widget;
				});
				return found !== undefined;
			});
			$scope[widget_area+"Widgets"] = queue.map(function(directive){
				return "<"+directive.toDash()+"/>";
			}).sort();
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
	}).fail(function(e){
		console.error(e);
	});
});

JUCI.page("overview", "pages/overview.html");
