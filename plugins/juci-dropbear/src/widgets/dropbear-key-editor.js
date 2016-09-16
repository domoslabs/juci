//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>


JUCI.app.directive("juciKeyEditor", function(){
	return {
		template: '<div><h4>{{"Full Key:"|translate}}</h4><br /><div style="word-wrap:break-word;">{{model.type}} {{model.key}} {{model.comment || ""}}</div></div>',
		scope: {
			"model":"=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
