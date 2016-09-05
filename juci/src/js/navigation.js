/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

// provides a service for managing all pages
// pages register with this service, and menus can query it to get the navigation tree

(function($juci){
	function JUCINavigation(){
		var data = {
			children: []
		};
		var self = this;
		this.clear = function(){
			data.children = [];
		};
		this.tree = function(path){
			if(!path)
				return data;
			return findNodeByPath(path);
		};
		this.findNodeByPage = function(page, node){
			var list = getAllNodes(node);
			return list.find(function(ch){ return ch.page === page; });
		};
		this.getHrefByNode = function(node){
			function findHref(n){
				if(!n) return "";
				if(n.page) return n.page;
				if(!n.children || !n.children.length){console.log("Error in menu pleace run $navigation.removeInvalidNodes"); return "";}
				return findHref(n.children[0]);
			}
			return findHref(node);
		};
		this.register = function(item){
			if(!item.path) return;
			var parts = item.path.split("/");
			if(parts.length > 3) { alert("ERROR: menu cant have more than 3 lvls"); return;}
			var obj = data;
			while(parts.length > 1){
				var node = obj.children.find(function(n){
					return n.path.split("/").pop() === parts[0];
				});
				if(!node){
					var n_path = obj.path ? obj.path + "/" + parts[0] : parts[0];
					var new_obj = {
						children: [],
						path: n_path, // this will create a string containing the missing path
						page: "",
						index: item.index || 99,
						modes: [],
						text: "menu-"+n_path.replace(/\//g, "-")+"-title"
					};
					obj.children.push(new_obj);
					obj = new_obj;
				}else{
					obj = node;
				}
				parts.shift();
			}
			if(!obj.children) obj.children = [];
			var index = obj.children.findIndex(function(ch){
				return ch.path === item.path;
			});
			if(index !== -1){
				obj.children[i] = item; //replace existing page
			}else{
				obj.children.push(item);
			}
		};
		this.removeInvalidNodes = function(){
			var to_delete = [];
			filterMenu(data, to_delete);
			if(to_delete.length){
				to_delete.map(function(del){ deleteNodeByPath(del);});
			}
		};
		this.sortNodes = function(){
			function sortCh(ch){
				if(!ch.children || !ch.children.length) return;
				ch.children.sort(function(a, b){
					return a.index - b.index;
				});
				ch.children.map(function(subch){
					sortCh(subch);
				});
			}
			sortCh(data);
		};

		//HELPER FUNCTIONS
		function hasValidChild(node){
			if(!node.children || !node.children.length) return false;
			var valid = node.children.find(function(subch){
				if(subch.path) return true;
				return hasValidChild(subch);
			});
			if(valid) return true;
			return false;
		};
		function filterMenu(node, to_delete){
			if(!node) node = data;
			if(!node.children || !node.children.length) return; //no sub-nodes
			node.children.map(function(ch){
				if(ch.page){ 								// valid node check sub-nodes
					filterMenu(ch);
				}else if(hasValidChild(ch)){ 				// valid node check sub-nodes
					filterMenu(ch);
				}else{ 										// invalid child REMOVE
					to_delete.push(ch.path);
				}
			});
		}
		function getAllNodes(node){
			var list = [];
			function flatten(tree){
				list.push(tree);
				if(!tree.children || !tree.children.length) return;
				tree.children.map(function(ch){
					if(ch._visited) alert("ERROR: loops in menu structure are not allowed! node "+ch.href+" already visited!");
					ch._visited = true;
					flatten(ch);
				});
			}
			flatten(node || data);
			list.map(function(ch){ delete ch._visited; }); // reset the flag for next time
			return list;
		};
		function findNodeByPath(path, node){
			var list = getAllNodes(node);
			return list.find(function(ch){ return ch.path === path; });
		};
		function deleteNodeByPath(path){
			var parts = path.split("/");
			if(parts.length > 3){ alsert("ERROR: cant delete item with more than 3 lvls"); return;}
			var obj = data;
			while(parts.length > 1){ // try to find the parrent of the path
				var node = obj.children && obj.children.find(function(n){
					return n.path.split("/").pop() === parts[0];
				});
				if(!node) return; // the node doesn't exist
				obj = node;
				parts.shift();
			}
			obj.children = obj.children.filter(function(ch){ return ch.path !== path;});
		};
	}
	JUCI.navigation = new JUCINavigation();

	JUCI.app.factory('$navigation', function navigationProvider(){
		return JUCI.navigation;
	});
})(JUCI);
