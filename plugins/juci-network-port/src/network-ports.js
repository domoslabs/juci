JUCI.app.factory("$port", function($uci){
	// fire off initial sync
	var sync = $uci.$sync("ports");

	function Port(){

	}

	Port.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred();
		var self = this;
		self.getPorts().done(function(list){
			var ports = {};
			list.map(function(x){ ports[x.id] = x; });
			adapters.forEach(function(dev, idx){
				// remove bcm switch interface from the list because it should never be used
				if(dev.device in ports){
					dev.name = ports[dev.device].name;
					dev.type = ports[dev.device].type;
					delete ports[dev.device];
				} else if(dev.device && dev.device.match(/br-.*/)){
					// rename the bridge to a better name
					dev.name = dev.device.substr(3).toUpperCase() + "-BRIDGE";
					dev.type = "eth-bridge"
				}
			});
			// add any devices that are not in the list of adapters (ones that are down for instance)
			Object.keys(ports).map(function(k){
				var device = ports[k];
				adapters.push({
					name: device.name,
					device: device.id,
					type: device.type
				});
			});
			def.resolve();
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}

	Port.prototype.getPorts = function(){
		var def = $.Deferred();

		sync.done(function(){
			var devices = [];
			if($uci.ports && $uci.ports["@ethport"]){
				devices = $uci.ports["@ethport"].map(function(port){
					return {
						get name(){ return port.name.value; },
						get id(){ return port.ifname.value; },
						get type(){ return "eth-port" },
						base: { name: port.name.value, id: port.ifname.value }
					};
				});
			}
			def.resolve(devices);
		});
		return def.promise();
	}

	return new Port();
});

JUCI.app.run(function($network, $port){
	$network.addSubsystem($port);
});

UCI.$registerConfig("ports");
UCI.ports.$registerSectionType("ethport", {
	"ifname": 	{ dvalue: "", type: String },
	"speed": 	{ dvalue: "auto", type: String },
	"pause": 	{ dvalue: false, type: Boolean },
	"name":		{ dvalue: "", type: String },
	"uplink":	{ dvalue: false, type: Boolean }
});
UCI.ports.$registerSectionType("sfpport", {
	"ifname": 	{ dvalue: "", type: String },
	"speed": 	{ dvalue: "auto", type: String },
	"pause": 	{ dvalue: false, type: Boolean },
	"name":		{ dvalue: "", type: String }
});


