/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

JUCI.app
.factory("$broadcomDsl", function($ethernet, $uci, $rpc){
	return {
		annotateAdapters: function(adapters){
			var def = $.Deferred(); 
			var self = this; 
			self.getDevices().done(function(list, devices){
				adapters.forEach(function(adapter, idx){
					if(adapter.device in devices){
						var dev = devices[adapter.device]; 
						adapter.name = dev.name; 
						adapter.type = dev.type; 
						delete devices[adapter.device]; 
					}
				}); 
				Object.keys(devices).map(function(devid){
					var dev = devices[devid]; 
					adapters.push({
						name: dev.name,
						device: dev.id, 
						type: dev.type, 
						state: "DOWN"
					}); 
				}); 
				def.resolve(adapters);  
			}); 
			return def.promise(); 
		},
		getDevices: function() {
			var deferred = $.Deferred(); 
			var devices = {}; 
			$uci.$sync(["layer2_interface_vdsl", "layer2_interface_adsl"]).done(function(){
				$uci.layer2_interface_vdsl["@vdsl_interface"].map(function(device){
					devices[device.ifname.value] = {
						get name() { return device.name.value; }, 
						get id() { return device.ifname.value; }, 
						get type() { return "vdsl"; }, 
						base: device
					}; 
				}); 
				$uci.layer2_interface_adsl["@atm_bridge"].map(function(device){
					devices[device.ifname.value] = {
						get name() { return device.name.value; }, 
						get id() { return device.ifname.value; }, 
						get type() { return "adsl"; }, 
						base: device
					}; 
				}); 
				deferred.resolve(Object.keys(devices).map(function(k){ return devices[k]; }), devices); 
			}).fail(function(){
				console.log("Could not sync DSL devices!"); 
			}); 
			return deferred.promise(); 
		}, 
		status: function(){
			return $rpc.$call("juci.broadcom.dsl", "run", {"method":"status"}); 
		}
	}; 
}).run(function($ethernet, $network, $uci, $broadcomDsl){
	$ethernet.addSubsystem($broadcomDsl); 
}); 


UCI.$registerConfig("layer2_interface_adsl"); 
UCI.layer2_interface_adsl.$registerSectionType("atm_bridge", {
	"unit":			{ dvalue: "", type: String }, 
	"ifname":		{ dvalue: "", type: String }, 
	"baseifname":		{ dvalue: "", type: String },
	"vci":			{ dvalue: "", type: String, validator: UCI.validators.NumberLimitValidator(32,65535) }, 
	"vpi":			{ dvalue: "", type: String, validator: UCI.validators.NumberLimitValidator(0,255) }, 
	"atmtype":		{ dvalue: "", type: String }, 
	"pcr":			{ dvalue: "", type: String, validator: UCI.validators.NumberLimitValidator(0,4294967296) }, 
	"scr":			{ dvalue: "", type: String, validator: UCI.validators.NumberLimitValidator(0,4294967296) }, 
	"mbs":			{ dvalue: "", type: String, validator: UCI.validators.NumberLimitValidator(0,4294967296) }, 
	"name":			{ dvalue: "", type: String }, 
	"link_type":		{ dvalue: "", type: String },
	"bridge":		{ dvalue: false, type: Boolean },
	"encapseoa":		{ dvalue: "", type: String },
	"encapspppoa":		{ dvalue: "", type: String },
	"encapsipoa":		{ dvalue: "", type: String }
});

UCI.$registerConfig("layer2_interface_vdsl"); 
UCI.layer2_interface_vdsl.$registerSectionType("vdsl_interface", {
	"unit":			{ dvalue: "", type: String }, 
	"ifname":		{ dvalue: "", type: String }, 
	"baseifname":		{ dvalue: "", type: String },
	"name":			{ dvalue: "", type: String }, 
	"dslat":		{ dvalue: "", type: String }, 
	"ptmprio":		{ dvalue: "", type: String }, 
	"bridge":		{ dvalue: false, type: Boolean },
	"ipqos":		{ dvalue: "", type: String }
});
