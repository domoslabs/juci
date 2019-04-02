//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.factory("$file", function($rpc, $tr, gettext, $rootScope){
	var saveByteArray = (function () {
		return function (data, name, fileType, a) {
			var byteChars = atob(data);
			var byteNumbers = [];
			for(var i = 0; i < byteChars.length; i++){
				byteNumbers.push(byteChars.charCodeAt(i));
			}
			var byteArray = new Uint8Array(byteNumbers);
			var blob = new Blob([byteArray], {type:fileType}),
			url = window.URL.createObjectURL(blob);
			a.setAttribute("style", "display: none");
			a.setAttribute("href", url);
			a.setAttribute("download", name);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			//window.URL.revokeObjectURL(url);
		};
	}());
	return {
		uploadFile: function(filename, file, onProgress){
			$rootScope.uploadFile = true;
			var fileChunkSize = 500000;
			var def = $.Deferred();
			if(!filename || !(file instanceof File)){
				$rootScope.uploadFile = false;
				return def.reject("invalid options");
			}
			var path;
			if(filename.substr(0,5) === "/tmp/") path = filename;
			else path = "/tmp/" + filename;
			var callId = 0;
			var fileUploadState = {
				file: file,
				reader: new FileReader(),
				offset: 0,
				id: ++callId,
				respwatcher: null
			};

			fileUploadState.reader.onload = function(e){
				if(e.target.error !== null){
					console.log("error reading file");
					setTimeout(function(){$rootScope.uploadFile = false; def.reject("error reading file");}, 0);
				}
				$rpc.$call("file", "write_tmp_juci", {
					path: path,
					data: e.target.result.split(",")[1],
					base64: true,
					append: fileUploadState.offset > 0
				}).done(function(){
					fileUploadState.id = ++callId;
					fileUploadState.offset += fileChunkSize;
					if(fileUploadState.offset < fileUploadState.file.size){
						if(onProgress && typeof onProgress === "function"){
							onProgress(fileUploadState.offset, fileUploadState.file.size);
						}
						fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
					}else{
						$rootScope.uploadFile = false;
						def.resolve();
					}
				}).fail(function(e){
					$rootScope.uploadFile = false;
					def.reject(e);
				});
			}
			fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
			return def.promise();
		},
		downloadFile: function(fileName, filetype, downloadName){
			$rootScope.downloadFile = true;
			var def = $.Deferred();
			if(!fileName){
				$rootScope.downloadFile = false;
				return def.reject();
			}
			if(fileName.startsWith("/tmp/juci/"))
				fileName = fileName.substring(10);

			if(fileName.match("/")){
				$rootScope.downloadFile = false;
				return def.reject();
			}
			var link = document.createElement("a");
			if (link.download === undefined){
				alert($tr(gettext("your browser does not support this kind of download, please refer to latest Chrome, Firefox, Opera or Edge etc.")));
				$rootScope.downloadFile = false;
				return def.reject();
			}
			var name = (downloadName)?downloadName:fileName;
			var filetype = filetype || "application/gzip";
			$rpc.$call("file", "read_tmp_juci", {path:"/tmp/juci/"+fileName, base64:true}).done(function(result){
				$rootScope.downloadFile = false;
				def.resolve(saveByteArray(result.data, name, filetype, link));
			}).fail(function(e){ $rootScope.downloadFile = false; def.reject(e);});
			return def.promise();
		},
		uploadString: function(filename, string){
			var def = $.Deferred();
			if(!filename || typeof string !== "string") return def.reject("you must give filename and string");
			if(filename.substr(0,5) !== "/tmp/") filename = "/tmp/" + filename;
			$rpc.$call("file", "write_tmp_juci", {"path":filename, "data":string}).done(function(ret){def.resolve(ret);}).fail(function(e){def.reject(e);});
			return def.promise();
		}
	}
});
