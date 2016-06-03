//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.factory("$file", function($rpc){
	return {
		fileChunkSize: 500000,
		uploadFile: function(filename, file, onProgress){
			var def = $.Deferred();
			if(!filename || !(file instanceof File)) return def.reject("invalid options");
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
					fileUploadState.offset += this.fileChunkSize;
					if(fileUploadState.offset < fileUploadState.file.size){
						if(onProgress && typeof onProgress === "function"){
							var progress = (100 / fileUploadState.file.size) * fileUploadState.offset;
							onProgress(progress);
						}
						fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + this.fileChunkSize));
					}else{
						def.resolve();
					}
				}).fail(function(e){
					def.reject(e);
				});
			}
			fileUploadState.reader.readAsDataURL(fileUploadState.file.slice(fileUploadState.offset, fileUploadState.offset + this.fileChunkSize));
			return def.promise();
		},
	}
});
