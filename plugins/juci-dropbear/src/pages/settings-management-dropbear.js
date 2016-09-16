/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Stefan Nygren <stefan.nygren@hiq.se>
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
.controller("dropbearSettings", function($scope, $uci, $rpc, $systemService, $network, $tr, gettext, $file, $juciDialog, $juciConfirm){
	var filename = "/tmp/tmpSshKey";
	$scope.data = {

	};
	
	$systemService.find("dropbear").done(function(service){
		$scope.service = service;
		$scope.$apply();
	});
	function firstLetterCapital(string){
		return String(string).charAt(0).toUpperCase() + String(string).slice(1);
	}

	$uci.$sync("dropbear").done(function(){
		$scope.dropbear = []; 
		if($uci.dropbear){
			$scope.dropbear = $uci.dropbear["@dropbear"];
			$scope.dropbear.map(function(db){
				db.$statusList = [
					{ label: $tr(gettext("Password Authentication")), value: firstLetterCapital(db.PasswordAuth.value) },
					{ label: $tr(gettext("Enable Root Password Authentication")), value: firstLetterCapital(db.RootPasswordAuth.value) },
					{ label: $tr(gettext("Enable Root Login")), value: firstLetterCapital(db.RootLogin.value) }
				];
			});
			$scope.$apply();
		}
	});
	
	$scope.getTitle = function(cfg){
		return $tr(gettext("Dropbear Instance on Interface: ")) + ((cfg.Interface.value != "") ? String(cfg.Interface.value).toUpperCase() : $tr(gettext("ANY"))) + " Port: " + cfg.Port.value;
	}

	$scope.onAddInstance = function(){
		$uci.dropbear.$create({
			".type":"dropbear"
		}).done(function() {
			$scope.$apply();
		});
	}
	$scope.onDeleteInstance = function(ins){
		if(!ins) alert($tr(gettext("Please select a instance in the list to remove")));
		if($scope.dropbear.length <= 0) {
			alert($tr(gettext("Unable to remove last instance")));
		} else {
			$juciConfirm.show($tr(gettext("Are you sure you want to remove this instance?"))).done(function(){
				ins.$delete().done(function(){
					$scope.$apply();
				});
			});
		}
	}

	$scope.onServiceEnableDisable = function(){
		if(!$scope.service) return;
		if($scope.service.enabled){
			$scope.service.disable().always(function(){ $scope.$apply(); });
		} else {
			$scope.service.enable().always(function(){ $scope.$apply(); });
		}
	}
	function refresh(){
		$rpc.$call("router", "get_ssh_keys").done(function(result){
			$scope.keyList = result.keys || [];
			$scope.keyList.map(function(key){
				key.$statusList = [
					{ label: $tr(gettext("Key")), value: key.key.substr(0,40) + "..." },
					{ label: $tr(gettext("Key Type")), value: key.type },
					{ label: $tr(gettext("Comment")), value: key.comment || $tr(gettext("No comment")) }
				];
			});
			$scope.$apply();
		}).fail(function(){
			$scope.keyList = [];
		}); 
	}
	refresh(); 

	$scope.onDeleteKey = function(item){
		if(!item) return;
		$juciConfirm.show($tr(gettext("Are you SURE you want to delete this key? You can not revert this"))).done(function(){
			$file.uploadString(filename, (item.type + " " + item.key + (item.comment ? " " + item.comment: ""))).done(function(ret){
				$rpc.$call("router", "del_ssh_key", {"path":filename}).done(function(ret){
					refresh();
				}).fail(function(er){
					alert(JSON.stringify("reason: " + er.reason + "\ndata: " + JSON.stringify(er.data )));
				});
			}).fail(function(er){ console.log(er); alert("couldn't delete key: " + JSON.stringify(er));});
		});
	}

	function add_ssh_key(model, inst){
		$rpc.$call("router", "add_ssh_key", {"path":filename}).done(function(ret){
			refresh();
			inst.close();
		}).fail(function(er){
			if(er.data && er.data.error)
				model.error = er.data.error;
			else
				model.error = JSON.stringify(er);
			$scope.$apply();
		});
	};

	$scope.onAddKey = function(){
		var model = {};
		$juciDialog.show("dropbear-add-key", {
			title: $tr(gettext("Add new SSH Key")),
			on_apply: function(btn, inst){
				model.error = null;
				if(!model.key && !model.file){
					model.error = $tr(gettext("You must enter a key or pick a key-file"));
					return;
				}
				if(model.key){
					$file.uploadString(filename, model.key).done(function(ret){
						add_ssh_key(model, inst);
					}).fail(function(e){model.error = e;});
				}else{
					if(!model.file.name || model.file.size < 1){ model.error = "Invalid file"; return; }
					$file.uploadFile(filename, model.file.files[0]).done(function(){
						add_ssh_key(model, inst);
					}).fail(function(e){console.log(e);model.error = JSON.stringify(e);});
				}
			},
			model: model
		});
	};

	$scope.getItemTitle = function(item){
		return item.comment ? item.comment : item.key.substr(-16);
	}
});
