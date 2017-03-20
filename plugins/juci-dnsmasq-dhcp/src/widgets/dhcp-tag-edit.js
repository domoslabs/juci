//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("dhcpTagEdit", function(){
	return {
		templateUrl: "/widgets/dhcp-tag-edit.html",
		scope: {
			tag: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
