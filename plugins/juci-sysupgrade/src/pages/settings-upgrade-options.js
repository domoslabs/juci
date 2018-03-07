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
.controller("SettingsUpgradeOptions", function($scope, $uci, $rpc, $tr, gettext, $juciDialog){
	$scope.allImageExtensions = [
		{ label: $tr(gettext(".y2 (UBIFS Image)")), value: ".y2" },
		{ label: $tr(gettext(".y3 (UBIFS Image)")), value: ".y3" },
	]; 
	
	$uci.$sync("system").done(function(){
		if($uci.system["@upgrade"].length === 0){
			$uci.system.$create({
				".type":"upgrade"
			}).done(function(upgrade){
				$juciDialog.show(null, {
					content: $tr(gettext("A missing section has been created")),
					buttons: [{ label: $tr(gettext("OK")), value: "ok", primary: true }],
					on_button: function(btn, inst){inst.close();},
					size: "sm"
				});
				$scope.upgrade = upgrade;
				$scope.$apply();
			});
		}else{
			$scope.upgrade = $uci.system["@upgrade" ][0];
			$scope.$apply(); 
		}
	}); 
}); 
