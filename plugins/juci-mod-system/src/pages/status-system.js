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

JUCI.app.run(function($uci){
	$uci.$sync("juci").done(function(){
		if($uci.juci && !$uci.juci.pagesystemstatus){
			$uci.juci.$create({
				".type":"pagesystemstatus",
				".name":"pagesystemstatus"
			});
		}
	});
})
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
	var sys = {};  
	var board = { release: {} }; 
	var filesystems = []; 
	var netLoad = {};
	JUCI.interval.repeat("update_status_system_page_clock", 1000, function(resume){
		if(sys && sys.system && sys.system.localtime){
			sys.system.localtime += 1;
			updateTable();
			setTimeout(function(){$scope.$apply();}, 0);
		}
		resume();
	});

	JUCI.interval.repeat("status_system_page_refresh", 5000, function(resume){
		async.parallel([
			function (cb){$rpc.$call("router", "info").done(function(res){sys = res; cb();}).fail(function(){cb();});},
			function (cb){$network.getNetworkLoad().done(function(load){ netLoad = load; cb(); }).fail(function(){cb();});},
			function (cb){
				$rpc.$call("system", "board").done(function(res){board = res; cb();}).fail(function(){cb();});
			},
			function (cb){$rpc.$call("router", "filesystem").done(function(res){
				filesystems = res.filesystem; 
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
			updateTable();
			$scope.$apply();
			resume(); 
		});
	}); 
	function updateTable(){
		$scope.systemStatusTbl.rows = [
			[$tr(gettext("Hostname")), board.hostname || $tr(gettext("N/A"))],
			[$tr(gettext("Model")), $config.board.system.hardware || $tr(gettext("N/A"))],
			[$tr(gettext("Serial No")), sys.system.serialno || $tr(gettext("N/A"))],
			[$tr(gettext("MAC Address")), sys.system.basemac || $tr(gettext("N/A"))],
			[$tr(gettext("Firmware Version")), $config.board.system.firmware || $tr(gettext("N/A"))],
			[$tr(gettext("Kernel Version")), board.kernel || sys.system.kernel || $tr(gettext("N/A"))],
			[$tr(gettext("Filesystem")), sys.system.filesystem || $tr(gettext("N/A"))],
			[$tr(gettext("BRCM Version")), sys.system.brcmver || $tr(gettext("N/A"))],
			[$tr(gettext("Local Time")), Date(sys.system.localtime)],
			[$tr(gettext("Uptime")), sys.system.uptime],
			[$tr(gettext("CPU")), (sys.system.cpu_per || 0)+"%"],
			[$tr(gettext("Active Connections")), '<juci-progress value="'+netLoad.active_connections+'" total="'+netLoad.max_connections+'"></juci-progress>']
		];

		$scope.systemMemoryTbl.rows = [
			[$tr(gettext("Usage")), '<juci-progress value="'+Math.round(sys.memoryKB.total - sys.memoryKB.free)+'" total="'+ Math.round(sys.memoryKB.total) +'" units="kB"></juci-progress>'],
			[$tr(gettext("Shared")), '<juci-progress value="'+Math.round(sys.memoryKB.shared)+'" total="'+ Math.round(sys.memoryKB.total) +'" units="kB"></juci-progress>'],
			[$tr(gettext("Buffered")), '<juci-progress value="'+Math.round(sys.memoryKB.buffers)+'" total="'+ Math.round(sys.memoryKB.total) +'" units="kB"></juci-progress>'],
			[$tr(gettext("Swap")), '<juci-progress value="0" total="0" units="kB"></juci-progress>']
		];

		if($config.settings && $config.settings.pagesystemstatus && $config.settings.pagesystemstatus.show_diskinfo.value){ 
			$scope.show_diskinfo = true; 
			$scope.systemStorageTbl.rows = []; 
			filesystems.map(function(disk){
				if(disk.name.split(":").length === 2) return;
				$scope.systemStorageTbl.rows.push([disk.name+" ("+disk.mounted_on+")", '<juci-progress value="'+Math.round(disk.used)+'" total="'+ Math.round(disk.available + disk.used) +'" units="kB"></juci-progress>']); 
			}); 
		}
	}

}); 

