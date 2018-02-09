/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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
.factory("$usb", function($rpc){
	function USB(){
		
	}
	
	USB.prototype.getDevices = function(){
		var def = $.Deferred(); 
		$rpc.$call("router.usb", "status").done(function(res){
			var usbs = Object.keys(res).map(function(usb){
				return res[usb];
			});
			if(usbs) def.resolve(usbs);
			else def.resolve([]);
		});
		return def.promise();
	}

	USB.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred();
		var self = this;
		var usbs = {};
		self.getDevices().done(function(devs){
			devs.filter(function(dev){
				return dev.netdevice;
			}).map(function(dev){
				usbs[dev.netdevice] = dev;
			});
			adapters.map(function(a){
				if(a.device in usbs){
					match = usbs[a.device];
					a.name = match.description || match.product || a.name || "";
					a.type = "eth-port";
					a.is_usb = true;
					delete usbs[a.device];
				}
			});
			Object.keys(usbs).map(function(key){
				adapters.push({
					name: usbs[key].description || usbs[key].product || "",
					type: "eth-port",
					is_usb: true,
					device: usbs[key].netdevice
				});
			});
			def.resolve();
		}).fail(function(e){
			console.log(e);
			return def.reject();
		});
		return def.promise();
	};
	
	return new USB(); 
}).run(function($events){	
	$events.subscribe("usb.device.add", function(event){
		console.log("USB Plugged in: "+JSON.stringify(event)); 
	});
});  

JUCI.app.run(function($usb, $network){
	$network.addSubsystem($usb);
});
