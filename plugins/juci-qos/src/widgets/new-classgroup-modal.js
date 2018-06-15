JUCI.app.requires.push("ui.bootstrap.typeahead"); 
JUCI.app.requires.push("ngAnimate"); 

JUCI.app
.directive("newClassgroupModal", function(){
	return {
		scope: {
			newClassgroup : "=ngModel"
		}, 
		templateUrl: "/widgets/new-classgroup-modal.html", 
		replace: true
	};
});
