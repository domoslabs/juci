//!Author: Rediar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.factory("$juciConfirm", function($juciDialog, $tr, gettext){
	return {
		show: function(content){
			var def = $.Deferred();
			if(!content || typeof content != "string") return def.reject($tr(gettext("$juciConfirm needs a content-string")));
			var letters = content.length;
			var size = "sm";
			if(size > 100) size = "md";
			if(size > 1000) sise = "lg";
			$juciDialog.show(null, {
				content: "<h4>"+content+"</h4>",
				size: size,
				on_button: function(btn, inst){
					inst.close();
					setTimeout(function(){
						def.resolve(btn.value);
					}, 0);
				}
			});
			return def;
		}
	}
});
