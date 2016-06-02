/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.controller("StatusTVPageCtrl", function($scope, $rpc, gettext){
	JUCI.interval.repeat("igmpstatusrefresh",5000,function(next){
		$rpc.$call("router", "igmptable").done(function(result){
			if(!result.table) {
				$scope.$emit("error", gettext("Unable to retreive igmptable from device!"));
				return;
			}
			$scope.igmptable = result.table;
			$scope.$apply();
		}).always(function(){next()});
	});
});
