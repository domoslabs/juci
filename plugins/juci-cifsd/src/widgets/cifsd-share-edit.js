JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

JUCI.app
.directive("cifsdShareEdit", function(){
	return {
		scope: {
			share: "=ngModel"
		}, 
		templateUrl: "/widgets/cifsd-share-edit.html", 
		controller: "cifsdShareEdit", 
		replace: true
	};
})
.controller("cifsdShareEdit", function($scope, $network, $modal, $juciDialog, $tr, gettext, $uci, $rpc){
	$scope.data = {}; 
	$scope.users = {
		all: [],
		out: []
	};

	$scope.$watch("share", function(value){
		if(!value) return; 
		$scope.data.model = (value.path.value.length > 3) ? value.path.value.slice(4): "";
		$uci.$sync("cifsd").done(function(){
			var users = $uci.cifsd["@users"];
			var selected = value.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	}); 
	$scope.reloadUsers = function(){
		if(!$scope.share) return;
		$uci.$sync("cifsd").done(function(){
			var users = $uci.cifsd["@users"];
			var selected = $scope.share.users.value.split(",").filter(function(u){
				return users.find(function(user){ return user.user.value == u; }) != null;
			});
			$scope.users.all = users.map(function(user){
				var sel = selected.find(function(sel){ return user.user.value == sel; });
				return {label: user.user.value + ((user.desc.value == "") ? "" : " (" + user.desc.value + ")"), value: user.user.value, selected: (sel)? true : false};
			});
			$scope.$apply();
		});
	};

	$scope.$watch("users.out", function(){
		if(!$scope.users || !$scope.users.out || !$scope.share) return;
		$scope.share.users.value = $scope.users.out.map(function(user){ return user.value; }).join(",");
	}, false);
	$scope.$watch("data.model", function(value){
		if(!$scope.share) return;
		$scope.filesystem = "";
		$rpc.$call("router.usb", "status").done(function(data){
			Object.keys(data).map(function(key){
				var usb = data[key];
				if(usb.mntdir && usb.mntdir === value.split("/")[1] && usb.filesystem && usb.filesystem.match("ext")){
					$scope.filesystem = String(usb.filesystem).toUpperCase();
					$scope.$apply();
				}
			});
		}).fail(function(e){console.log(e);});
		$scope.share.path.value = "/mnt" + value;
	}, false);

	$scope.onAutocomplete = function(query){
		var def = null
		return function(){
			if(!def){
				def = $.Deferred(); 
				$scope.loadingLocations = true;
				query = query.replace(/\/\.\./g,"");
				$rpc.$call("router.directory", "autocomplete", { "path": "/mnt/"+query }).done(function(result){
					if(!result.folders)
						def.reject();
					var clean = result.folders.map(function(folder){
						if(folder.match(/^\/mnt/))
							return folder.slice(4);
						return folder;
					});
					def.resolve(clean);
				}).fail(function(){
					def.reject(); 
				}).always(function(){def = null; $scope.loadingLocations = false;});
			}
			return def.promise(); 
		}();
	}
	$scope.onAddFolder = function(){
		var model = {}
		$juciDialog.show("cifsd-file-tree", {
			title: $tr(gettext("Add folder to share")),
			model: model,
			on_apply: function(){
				if(!model.path)return true;
					$scope.data.model = model.path;
				return true;
			}	
		});
	};

}); 
