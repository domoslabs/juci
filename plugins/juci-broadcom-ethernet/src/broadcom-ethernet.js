JUCI.app.factory("$broadcomEthernet", function($uci){
	// fire off initial sync
	var sync = $uci.$sync(["layer2_interface_ethernet", "ports"]);

	function Ethernet(){

	}

	Ethernet.prototype.configureWANPort = function(devname){
		var def = $.Deferred();
		if(!devname){
			// delete the Wan section
			if($uci.layer2_interface_ethernet.Wan){
				$uci.layer2_interface_ethernet.Wan.$delete().done(function(){ def.resolve();}).fail(function(e){def.reject(e);});
			}else{
				return def.resolve();
			}
			return def.promise();
		}
		// WAN port for broadcom phy must be configured specially so we do it in layer2_interface_ethernet (the name is a little misleading because the config is only used to set wan port on the ethernet connector!)
		function setInterface(devname){
			var wan = $uci.layer2_interface_ethernet.Wan;
			if(devname.split(".").length == 1)
				wan.ifname.value = devname + ".1";
			wan.baseifname.value = devname;
		}
		if(!$uci.layer2_interface_ethernet.Wan){
			$uci.layer2_interface_ethernet.$create({
				".type": "ethernet_interface",
				".name": "Wan"
			}).done(function(){
				setInterface(devname);
				def.resolve();
			});
		} else {
			setInterface(devname);
			setTimeout(function(){ def.resolve(); }, 0);
		}
		return def.promise();
	}

	Ethernet.prototype.annotateAdapters = function(adapters){
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

	Ethernet.prototype.getPorts = function(){
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
			if($uci["layer2_interface_ethernet"] && $uci["layer2_interface_ethernet"]["@ethernet_interface"]){
				var ports = $uci["layer2_interface_ethernet"]["@ethernet_interface"];
				ports.map(function(port){
					devices.push({
						get name(){ return "WAN"; },
						get id(){ return port.ifname.value; },
						get type(){ return "vlan"; }
					});
				});
			}
			def.resolve(devices);
		});
		return def.promise();
	}

	return new Ethernet();
});

JUCI.app.run(function($ethernet, $broadcomEthernet){
	$ethernet.addSubsystem($broadcomEthernet);
});

UCI.$registerConfig("layer2_interface_ethernet");
UCI.layer2_interface_ethernet.$registerSectionType("ethernet_interface", {
	"name":					{ dvalue: '', type: String },
	"ifname":				{ dvalue: '', type: String },
	"baseifname":			{ dvalue: '', type: String },
	"bridge":				{ dvalue: false, type: Boolean }
});

UCI.$registerConfig("ports");
UCI.ports.$registerSectionType("ethport", {
	"ifname": 	{ dvalue: "", type: String },
	"speed": 	{ dvalue: "auto", type: String },
	"pause": 	{ dvalue: false, type: Boolean },
	"name":		{ dvalue: "", type: String }
});
UCI.ports.$registerSectionType("sfpport", {
	"ifname": 	{ dvalue: "", type: String },
	"speed": 	{ dvalue: "auto", type: String },
	"pause": 	{ dvalue: false, type: Boolean },
	"name":		{ dvalue: "", type: String }
});

