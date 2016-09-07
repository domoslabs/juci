JUCI.app
.factory("$juciInputModal", function($modal, $network, $tr, gettext, $modal, $juciDialog){
	return {
		show: function(titleIn, inputTitleIn, variableIn, applyFunctionIn){
			var def = $.Deferred(); 
			$juciDialog.show("juci-input-modal", {
				title: titleIn,
				model: {"variable":variableIn, "inputTitle":inputTitleIn},
				on_apply: applyFunctionIn
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
			juciInputModalData: "=ngModel"
		},
		templateUrl: "/widgets/juci-input-modal.html"
	};
})
.controller("juciInputModalCtrl", function($scope, $uci){
	// kolla om model.modelIn.validator finns
	// 	annars gör en default - $uci.validators.defaultValidator
});
