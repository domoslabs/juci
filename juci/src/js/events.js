//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
//

!function(){
	function EventManager(){
			this.callbacks = {};
	}
	EventManager.prototype.removeAll = function(){
		Object.keys(this.callbacks).map(function(type){
			$rpc.$unregisterEvent(type);
			//TODO: handle errors
		});
		this.callbacks = {};
	}
	EventManager.prototype.subscribe = function(type, callback){
		if(!this.callbacks[type]){
		   	this.callbacks[type] = [];
			$rpc.$registerEvent(type);
			//TODO: handle errors
		}
		this.callbacks[type].push(callback); 
	}
	EventManager.prototype.resubscribe = function(){
		var self = this;
		Object.keys(self.callbacks).map(function(type){
			$rpc.$registerEvent(type);
		});
	}
	JUCI.events = new EventManager();
	
	JUCI.app.run(function($rpc){
		var self = JUCI.events;
		$rpc.$registerEventHandler(function(e){
			if (!e || !e.type) return;
			if(!self.callbacks[e.type])return;
			console.log(e.type + "-event: "+ JSON.stringify(e.data || {}));
			self.callbacks[e.type].map(function(cb){
				if(cb && typeof cb === "function") cb(e);
			});
		});
	}); 
	
	JUCI.app.factory("$events", function(){
		return JUCI.events; 
	}); 
	
}();
