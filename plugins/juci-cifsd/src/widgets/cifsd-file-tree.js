JUCI.app
.directive("cifsdFileTree", function(){
	return {
		templateUrl: "/widgets/cifsd-file-tree.html",
		scope: {
			model: "=ngModel"	
		},
		require: "^ngModel",
		controller: "cifsdFileTreeController"
	};
}).controller("cifsdFileTreeController", function($scope, $rpc, $tr, gettext){
	$scope.data = {
			tree: [{
			label: $tr(gettext("Loading.."))
		}]
	}; 
	$scope.on_select = function(branch){
		if(!branch || !branch.path) return;
		$scope.model.path = branch.path.slice(4); 
	}
	$rpc.$call("router.directory", "folder_tree", {}).done(function(data){
		function to_tree_format(obj){
			return Object.keys(obj).map(function(folder){
				if(obj[folder]["children"]){
					var tmp = {
						label: "/"+folder+"/",
						path: obj[folder]["path"]
					}
					if(typeof obj[folder]["children"] == "object"){
						tmp.children = to_tree_format(obj[folder]["children"]);
					}
					return tmp;
				}
			});
		}
		$scope.data.tree = to_tree_format(data); 
		$scope.$apply();
	});
});
