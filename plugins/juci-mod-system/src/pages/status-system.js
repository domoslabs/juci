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

UCI.juci.$registerSectionType("pagesystemstatus", {
	"show_meminfo": 	{ dvalue: true, type: Boolean }, 
	"show_diskinfo": 	{ dvalue: true, type: Boolean },
	"show_loadavg":		{ dvalue: false, type: Boolean }
}); 
UCI.juci.$insertDefaults("pagesystemstatus"); 

JUCI.app
.controller("StatusSystemPage", function ($scope, $rootScope, $uci, $rpc, gettext, $tr, $config, $network) {
	$scope.showExpert = $config.local.mode == "expert";

	$scope.systemStatusTbl = {
		rows: [["", ""]]
	}; 
	$scope.systemMemoryTbl = {
		rows: [["", ""]]
	}; 
	$scope.systemStorageTbl = {
		rows: [["", ""]]
	}; 
	var info = {};
	var sys = {};  
	var board = { release: {} }; 
	var filesystems = []; 
	var netLoad = {};

	var prev_cpu = {}; 

	JUCI.interval.repeat("status.system.refresh", 1000, function(resume){
		async.parallel([
			function (cb){$rpc.juci.system.run({"method":"info"}).done(function(res){info = res; cb();}).fail(function(){cb();});},
			function (cb){$rpc.system.info().done(function(res){sys = res; cb();}).fail(function(){cb();});},
			function (cb){$network.getNetworkLoad().done(function(load){ netLoad = load; cb(); }).fail(function(){cb();});},
			function (cb){
				if(!$rpc.system.board) cb(); 
				else $rpc.system.board().done(function(res){board = res; cb();}).fail(function(){cb();});
			},
			function (cb){$rpc.juci.system.run({"method":"filesystems"}).done(function(res){
				filesystems = res.filesystems; 
				cb();
			}).fail(function(){cb();});}
		], function(){
			function timeFormat(secs){
				secs = Math.round(secs);
				var days = Math.floor(secs / (60 * 60 * 24)); 
				var hours = Math.floor(secs / (60 * 60));

				var divisor_for_minutes = secs % (60 * 60);
				var minutes = Math.floor(divisor_for_minutes / 60);

				var divisor_for_seconds = divisor_for_minutes % 60;
				var seconds = Math.ceil(divisor_for_seconds);
				
				function pad(a,b){return(1e15+a+"").slice(-b)}
				
				return ((days > 0)?""+days+"d ":"")+pad(hours,2)+":"+pad(minutes,2)+":"+pad(seconds,2);
			}
			
			var cpu_load = 0; 
			try {
				cpu_load = Math.round(100 * (prev_cpu.usr - info.system.cpu.usr) / (prev_cpu.total - info.system.cpu.total)); 
			} catch(e){
				console.log(e);
			}
			prev_cpu = info.system.cpu; 

			$scope.systemStatusTbl.rows = [
				[$tr(gettext("Hostname")), board.hostname || info.system.name],
				[$tr(gettext("Model")), $config.board.system.hardware || $tr(gettext("N/A"))],
				[$tr(gettext("Firmware Version")), $config.board.system.firmware || $tr(gettext("N/A"))],
				[$tr(gettext("Local Time")), new Date(sys.localtime * 1000)],
				[$tr(gettext("Uptime")), timeFormat(sys.uptime)],
				[$tr(gettext("CPU")), ""+(cpu_load || 0)+"%"],
				[$tr(gettext("Kernel Version")), board.kernel || info.system.kernel || $tr(gettext("N/A"))],
				[$tr(gettext("Filesystem")), info.system.filesystem || $tr(gettext("N/A"))],
				[$tr(gettext("Active Connections")), '<juci-progress value="'+netLoad.active_connections+'" total="'+netLoad.max_connections+'"></juci-progress>']
			];
			
			$scope.systemMemoryTbl.rows = [
				[$tr(gettext("Usage")), '<juci-progress value="'+Math.round((sys.memory.total - sys.memory.free) / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Shared")), '<juci-progress value="'+Math.round(sys.memory.shared / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Buffered")), '<juci-progress value="'+Math.round(sys.memory.buffered / 1000)+'" total="'+ Math.round(sys.memory.total / 1000) +'" units="kB"></juci-progress>'],
				[$tr(gettext("Swap")), '<juci-progress value="'+Math.round((sys.swap.total - sys.swap.free) / 1000)+'" total="'+ Math.round(sys.swap.total / 1000) +'" units="kB"></juci-progress>']
			];
			
			if($uci.juci["pagesystemstatus"] && $uci.juci["pagesystemstatus"].show_diskinfo.value){ 
				$scope.show_diskinfo = true; 
				$scope.systemStorageTbl.rows = []; 
				filesystems.map(function(disk){
					$scope.systemStorageTbl.rows.push([disk.filesystem+" ("+disk.path+")", '<juci-progress value="'+Math.round(disk.used)+'" total="'+ Math.round(disk.total) +'" units="kB"></juci-progress>']); 
				}); 
			}

			$scope.$apply(); 
			resume(); 
		});
	}); 
}); 

