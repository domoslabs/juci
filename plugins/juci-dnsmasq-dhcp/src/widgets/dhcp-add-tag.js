//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("dhcpAddTag", function(){
	return {
		templateUrl: "/widgets/dhcp-add-tag.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
