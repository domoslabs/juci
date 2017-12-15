//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
/*global Promise:false*/

JUCI.app
.controller("MiniDLNAConfigPage", function($uci, $sce, $network, $scope, $minidlna, $tr, gettext, $rpc, $juciDialog){
	$uci.$sync("minidlna").done(function(data){
		$scope.minidlnaPort = "8200";
		try{ $scope.minidlnaPort = $uci.minidlna["@all"][0].port.value; }catch(err){console.log(err);}
		$scope.iframeURL = $sce.trustAsResourceUrl("http://" + window.location.hostname + ":"+$scope.minidlnaPort);
		$scope.$apply();
	});
	$scope.data = [{label:"loading"}];
	$scope.network = {
		all : [],
		selected : []
	};
	$scope.port = {};
	$scope.album_art = []
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.port.value = Number($scope.config.port.value);
		$scope.album_art = $scope.config.album_art_names.value.split("/");
		$scope.tagslistData = $scope.config.media_dir.value.filter(function(dir){
			var pre = dir.substr(0, 2);
			var dirr;
			if(pre == "A," || pre == "V," || pre == "P,"){
				dirr = dir.substr(2);
			}else{
				dirr = dir;
			}
			return (dirr === "/mnt" || dirr.substring(0, 5) == "/mnt/");
		}).map(function(dir){
			if(dir.match(/^[AVP],/)){ // ex, A,/mnt/usb/folder -> { text: A,/usb/folder, path: A,/mnt/usb/folder }
				return {
					text: dir.substr(0, 2) + "/" + (dir.length > 6 ? dir.substr(7) : ""),
					path: dir
				};
			}
			return {
				text: "/" + (dir.length > 4 ? dir.substr(5) : ""),
				path: dir
			};
		});
		$network.getNetworks().done(function(data){
			$scope.network.all = data.map(function(x){
				return {
					name:x[".name"],
					selected: ($scope.config.network.value.split(",").indexOf(x[".name"]) > -1)
				}
			});
			$scope.$apply();
		});
	});

/*
	setTimeout(function(){ // give the service time to reload
		JUCI.interval.repeat("update-minidlna-status", 5000, function(next){
			$rpc.$call("juci.minidlna", "status", {}).done(function(data){
				if(data.error){
					$scope.error = data.error;
					$scope.$apply();
				}else{
					$scope.error = null;
					$scope.is_running = data.running ? "active" : "inactive";
					$scope.count = data.count;
					$scope.$apply();
				}
			}).always(function(){next();});
		});
	}, 500);
*/

	$scope.root_dir = [
		{ label: $tr(gettext("Standard Container")),	value: "." },
		{ label: $tr(gettext("Browse directory")), 		value: "B" },
		{ label: $tr(gettext("Music")),					value: "M" },
		{ label: $tr(gettext("Video")),					value: "V" },
		{ label: $tr(gettext("Pictures")),				value: "P" }
	];
	$scope.$watch('port', function(){
		if(!$scope.port.value)return;
		$scope.config.port.value = $scope.port.value;
	}, true);
	$scope.onChangeAAName = function(tag){
		var index = null;
		if((index = $scope.album_art.indexOf(tag.text)) > -1){
			$scope.album_art.splice(index,1);
		}else{
			$scope.album_art.push(tag.text);
		}
		$scope.config.album_art_names.value = $scope.album_art.join("/");
	};
	$scope.$watch("network.selected", function(){
		if(!$scope.config)return;
		$scope.config.network.value = $scope.network.selected.map(function(x){
			return x.name;
		}).join();
	}, true);
	$scope.onAddFolder = function(){
		var model = {}
		$juciDialog.show("minidlna-file-tree", {
			title: $tr(gettext("Add folder to share")),
			model: model,
			on_apply: function(){
				if(!model.selected || !model.selected.path)return false;
				for(var i=0; i < $scope.tagslistData.length; i++){
					var prefix = $scope.tagslistData[i].path.substr(0,2);
					if(prefix  == "V," || prefix == "A," || prefix == "P,")
						if($scope.tagslistData[i].path.substr(2) == model.selected.path) return false;
					if($scope.tagslistData[i].path == model.selected.path) return false;
				}
				if(model.selected_dirtype != ""){
					$scope.tagslistData.push({
						path: model.selected_dirtype + "," + model.selected.path,
						text: model.selected_dirtype + "," + model.selected.path.substr(4)
					});
				}else{
					$scope.tagslistData.push({
						path: model.selected.path,
						text: model.selected.path.substr(4)
					});
				}
				$scope.updateConfig();
				return true;
			}	
		});
	};
	$scope.onTagAdded = function(tag){
		$scope.tagslistData = $scope.tagslistData.map(function(k){
			if(k.text == tag.text){
				if(k.text.match(/^[AVP],/))
					k.path = k.text.substr(0, 2) + "/mnt" + k.text.substr(2);
				else
					k.path = "/mnt"+k.text;
			}
			return k;
		});
		$scope.updateConfig();
	};
	$scope.updateConfig =  function(){
		$scope.config.media_dir.value = $scope.tagslistData.map(function(dir){
			return dir.path;
		});
	};
	var tag_promise = null;
	$scope.loadTags = function(text){
		if(tag_promise == null) tag_promise = new Promise(function(resolve, reject){
			var prefix = "";
			if(text.match(/^[AVP],/)){
				prefix = text.substr(0, 2);
				text = text.substr(2);
			}
			$rpc.$call("router.directory", "autocomplete", {"path":"/mnt" + text}).done(function(data){
				tag_promise = null;
				if(data.folders){
					data.folders = data.folders.map(function(folder){
						return prefix + folder.substring(4);
					});
					resolve(data.folders);
				}else reject(data);
			}).fail(function(e){
				tag_promise = null;
				reject(e);
			});
		});
		return tag_promise;
	};

	function updateIframe(){
		if(!document.getElementById('iframe')){ return; }
		document.getElementById('iframe').src = $scope.iframeURL;
	}
	JUCI.interval.repeat("updateIframe",10000,function(next){
		updateIframe();
		next();
	});
}); 
