JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

JUCI.app
.directive("newClassModal", function(){
	return {
		scope: {
			newClass : "=ngModel"
		}, 
		templateUrl: "/widgets/new-class-modal.html", 
		replace: true
	};
});
