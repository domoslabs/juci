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
.directive("overviewSliderWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-slider-network.html", 
		controller: "overviewSliderWidget10Network", 
		replace: true
	};
})
.controller("overviewSliderWidget10Network", function($rpc, $config, $firewall, $events){
	var nodes = []; 
	var edges = []; 
	var def;
	
	var optionsFA = {
		nodes: {
			color: "#999999", 
			font: {size:15, color:'white' }, 
			borderWidth: 3
		},
		interaction: {
			dragView: false,
			zoomView: false,
			selectable: false
		}
	};
	
	function updateData(){
		nodes = [];
		edges = [];
		if(def) return def.promise();
		def = $.Deferred(); 
		
		nodes.push({
			id: ".root",
			label: $config.board.system.hardware,
			image: "/img/net-router-icon.png", 
			shape: "image", 
			x: 50, y: 0, 
			size: 60, 
			physics: false, 
			fixed: { x: true, y: true }
		}); 
		
		nodes.push({
			id: ".lan_hub",
			x: -50, y: 0, 
			physics: false, 
			fixed: { x: true, y: true }
		});
		edges.push({ from: ".root", to: ".lan_hub", width: 8, smooth: { enabled: false } }); 
		
		nodes.push({
			id: ".wan_hub",
			x: 150, y: 0, 
			physics: false, 
			fixed: { x: true, y: true }
		});
		edges.push({ from: ".root", to: ".wan_hub", width: 8, smooth: { enabled: false } }); 
		
		var clients, lan_nets, wan_nets;
		async.series([
			function(next){
				$rpc.router.clients().done(function(cli){
					clients = cli;
			}).always(function(){next();});
			}, function(next){
				$firewall.getZoneNetworks("lan").done(function(nets){
					lan_nets = nets;
				}).always(function(){next();});
			}, function(next){
				$firewall.getZoneNetworks("wan").done(function(nets){
					wan_nets = nets;
				}).always(function(){next();});
			}], function(){
				var count = 0;
				wan_nets.map(function(wan){
					if(wan.ifname.value.match(/^@.+/) || wan.defaultroute.value == false || !wan.$info || !wan.$info.up) return;
					var node = {
						id: wan[".name"] + ".network." + count + Date.now(),
						label: String(wan[".name"]).toUpperCase(),
						image: "/img/net-interface-wan-icon.png",
						shape: "image",
						fixed: { x: true, y: false },
						x: 250
					}
					count++;
					nodes.push(node);
					edges.push( { from: ".wan_hub", to: node.id, width: 6, smooth: { enabled: true } });
				});
				count = 0;
				lan_nets.map(function(lan){
					if(!lan.$info.up) return;
					var node = {
						id: "lan.network." + count,
						label: String(lan[".name"]).toUpperCase(),
						image: "/img/net-interface-icon.png", 
						shape: "image",
						fixed: { x: true, y: false },
						x: -150
					}
					count++;
					nodes.push(node);
					edges.push( { from: ".lan_hub", to: node.id, width: 6, smooth: { enabled: true } });
					var cl_count = 0;
					if(!clients)return;
					Object.keys(clients).map(function(cl){ return clients[cl];})
					.filter(function(cl){ return (cl.network && cl.network == lan.$info.interface);})
					.map(function(cl){
						if(!cl.connected) return;
						var cl_node = {
							id: cl.macaddr+cl.ipaddr,
							label: String(cl.hostname || "Unknown").toUpperCase()+"\n"+String(cl.ipaddr).toUpperCase(),
							image: "/img/net-laptop-icon.png",
							shape: "image",
							fixed: { x: true, y: false },
							x: -(250 + (100 * Math.floor(cl_count/5)))
						}
						cl_count ++;
						nodes.push(cl_node);
						if(cl.wireless){
							edges.push({ from: node.id, to: cl_node.id, width: 4, dashes: true});
						}else{
							edges.push({ from: node.id, to: cl_node.id, width: 4});
						}
					});
				});
				def.resolve();
				def = undefined;
			}
		);
		return def;
	}

	updateData().done(function(){
		// create a network
		var containerFA = document.getElementById('mynetworkFA');
		var time = Date.now();
		window.onresize=function(){
				console.log(time);
			if(Date.now() - time > 100){ //limit the number of time this is called to every 100 ms
				network.setData({nodes: nodes, edges: edges});
				time = Date.now();
			}
		}
		var dataFA = {
			nodes: nodes,
			edges: edges
		};
		var network = new vis.Network(containerFA, dataFA, optionsFA);
		$events.subscribe("client", function(){
			updateData().done(function(){
				network.setData({nodes: nodes, edges: edges});
			});
		});
		$events.subscribe("network.interface", function(){
			updateData().done(function(){
				network.setData({nodes: nodes, edges: edges});
			});
		});
	});
});
