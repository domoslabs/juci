//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("dhcpClassificationEditor", function(){
	return {
		templateUrl: "/widgets/dhcp-classification-editor.html",
		scope: {
			classification: "=ngModel"
		},
		controller: "dhcpClassificationEditorCtrl",
		replace: true,
		require: "^ngModel"
	};
}).controller("dhcpClassificationEditorCtrl", function($scope){
	$scope.$watch("classification", function(cl){
		if(!cl)
			return;
		$scope.dhcpOptions = cl.dhcp_option.value.map(function(dhcp_option){
			return { label: dhcp_option };
		});
		$scope.$watch("dhcpOptions", function(opt){
			if(opt)
				$scope.classification.dhcp_option.value = opt.map(function(o){ return o.label; });
		}, true);
	}, false);
});

