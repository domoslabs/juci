JUCI.app.factory("$port", function($uci){
	// fire off initial sync
	var sync = $uci.$sync("ports");

	function Port(){

	}

	Port.prototype.annotateAdapters = function(adapters){
		duplicate = function(obj){
			try {
				return JSON.parse(JSON.stringify(obj));
			} catch(e){
				console.log("Error: " + String(e));
				return null;
			}
		}
		var def = $.Deferred();
		var self = this;
		self.getPorts().done(function(list){
			var ports = {};
			var dup_adapters = [];
			list.map(function(x){ ports[x.id] = x; });
			adapters.forEach(function(dev, idx){
				// remove bcm switch interface from the list because it should never be used
				if(dev.device in ports){
					// check if it has already been annotated if so duplicate it
					if(dev["__annotated__"]){
						var new_dev = duplicate(dev);
						if (!new_dev)
							return;
						new_dev.name = ports[dev.device].name;
						new_dev.type = ports[dev.device].type;
						new_dev.direction = ports[dev.device].direction;
						new_dev["__annotated__"] = true;
						dup_adapters.push(new_dev);
						return;
					}
					dev.name = ports[dev.device].name;
					dev.type = ports[dev.device].type;
					dev.direction = ports[dev.device].direction;
					dev["__annotated__"] = true;
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
					type: device.type,
					direction: device.direction
				});
			});
			dup_adapters.forEach(function(ad){ adapters.push(ad);});
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
						get direction(){ return port.uplink.value ? "up" : "down" }
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


