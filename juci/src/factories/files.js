//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.factory("$file", function($rpc){
	var saveByteArray = (function () {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		return function (data, name, fileType) {
			var byteChars = atob(data);
			var byteNumbers = [];
			for(var i = 0; i < byteChars.length; i++){
				byteNumbers.push(byteChars.charCodeAt(i));
			}
			var byteArray = new Uint8Array(byteNumbers);
			var blob = new Blob([byteArray], {type:fileType}),
			url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = name;
			a.click();
			window.URL.revokeObjectURL(url);
		};
	}());
	return {
		uploadFile: function(filename, file, onProgress){
			var fileChunkSize = 500000;
			var def = $.Deferred();
			if(!filename || filename.match("/") || !(file instanceof File)) return def.reject("invalid options");
			var path = "/tmp/" + filename;
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
					setTimeout(function(){def.reject("error reading file");}, 0);
				}
				$rpc.$call("file", "write", {
					path: path,
					data: e.target.result.split(",")[1],
					base64: true,
					append: fileUploadState.offset > 0
				}).done(function(){
					fileUploadState.id = ++callId;
					fileUploadState.offset += fileChunkSize;
					if(fileUploadState.offset < fileUploadState.file.size){
						if(onProgress && typeof onProgress === "function"){
							var progress = (100 / fileUploadState.file.size) * fileUploadState.offset;
							onProgress(progress);
						}
						fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
					}else{
						def.resolve();
					}
				}).fail(function(e){
					def.reject(e);
				});
			}
			fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + fileChunkSize));
			return def.promise();
		},
		downloadFile: function(fileName, filetype, downloadName){
			var def = $.Deferred();
			if(!fileName || fileName.match("/")) return def.resolve();
			var name = (downloadName)?downloadName:fileName;
			var filetype = filetype || "application/gzip";
			$rpc.$call("file", "read", {path:"/tmp/"+fileName, base64:true}).done(function(result){
				def.resolve(saveByteArray(result.data, name, filetype));
			}).fail(function(e){ def.reject(e);});
			return def;
		},
	}
});
