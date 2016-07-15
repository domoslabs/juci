//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("owsdPageCtrl", function($scope, $uci, $tr, gettext, $juciDialog){
	$uci.$sync("owsd").done(function(){
		$scope.allListen = $uci.owsd["@owsd-listen"];
		$scope.$apply();
	}).fail(function(e){console.log(e);});
	$scope.getOwsdListenTitle = function(item){
		return String(item[".name"]).toUpperCase().replace(/_/g, ' ');
	}
	$scope.onAddListen = function(){
		var model = {};
		$juciDialog.show("owsd-add-item", {
			title:$tr(gettext("Add OWSD Listen interface")),
			buttons: [
				{ label: $tr(gettext("Add")), value: "add", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel"}
			],
			on_button: function(btn, inst){
				if(btn.value == "add"){
					if(!model.name || model.name.length < 1) return;
					$uci.owsd.$create({
						".type":"owsd-listen",
						".name":String(model.name).replace(/ /g, '_')
					}).fail(function(e){
						console.log(e);
					}).always(function(){
						$scope.$apply();
						inst.close();
					});
				}else{
					inst.close();
				}
			},
			model: model
		});
	}

	$scope.onDeleteListen = function(item){
		if(!item || !item.$delete) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	}
});
