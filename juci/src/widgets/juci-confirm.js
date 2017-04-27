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
			$juciDialog.show(null, {
				content: "<h4>"+content+"</h4>",
				size: size,
				buttons: [
					{ label: $tr(gettext("OK")), value: "ok", primary: true },
					{ label: $tr(gettext("Cancel")), value: "cancel" }
				],
				on_button: function(btn, inst){
					inst.close();
					if(btn.value === "ok")
						def.resolve(true);
					else
						def.reject(false);
				}
			});
			return def;
		}
	}
})
.factory("$juciAlert", function($juciDialog, $tr, gettext){
	return function(text){
		var def = $.Deferred();
		if(!text || typeof text != "string") return def.reject();
		var letters = text.length;
		var size = "sm";
		if(letters > 100) size = "md";
		$juciDialog.show(null, {
			content: "<h4>"+text+"</h4>",
			size: size,
			buttons: [ {label: $tr(gettext("Close")), value: "" } ],
			on_button: function(btn, inst){
				inst.close();
				def.resolve("ok");
			}
		});
		return def;
	}
});
