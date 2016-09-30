JUCI.app.factory("$wiki", function($rootScope, $uci, $config, gettextCatalog, $localStorage){
	var uci = $config.settings && $config.settings.wiki;
	var user = $rootScope.has_capability('can-pick-uplink-port') ? 'ad':'us';
	var mode = ($localStorage.getItem("mode") || "expert") === "expert" ? 'e':'b';
	if(uci){
		var server = uci.server.value;
		var version = uci.version.value;
		var language = uci.language.value;
		var show = uci.visible.value
	}
	return {
		getHref: function(input){
			if(!show || !user || !mode || !server || !version || !language) return "";
			return server + "/" + version + "/" + language + "/" + user + mode + input;
		}
	}
});
