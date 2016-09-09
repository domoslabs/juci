JUCI.app
.factory("$juciInputModal", function($modal, $network, $tr, gettext, $modal, $juciDialog){
	return {
		//TODO: (title,{{inputTitle:"",variable:""}, ...},applyfunction)
		show: function(title,inputTitle,variable,applyFunction){
			var def = $.Deferred(); 
			$juciDialog.show("juci-input-modal", {
				title: title,
				model: {"variable":variable, "title":inputTitle},
				on_apply: applyFunction
			})
			.done(function(){def.resolve();})
			.fail(function(){def.reject();});
			return def.promise();
		}
	} 
})
.directive("juciInputModal", function(){
	return {
		scope: {
			data: "=ngModel"
		},
		templateUrl: "/widgets/juci-input-modal.html"
	};
});
