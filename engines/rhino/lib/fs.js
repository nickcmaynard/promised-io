// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// -- tolmasky Francisco Tolmasky
// -- dangoor Kevin Dangoor


var File = require("file"),
	LazyArray = require("../../../lib/lazy-array").LazyArray,
    defer = require("../../../lib/promise").defer;
for(var i in File){
	exports[i] = File[i];
}

exports.readFileSync = File.read;
exports.writeFileSync = File.write;
exports.mkdirSync = File.mkdir;
exports.readdir = exports.list;
exports.stat = exports.statSync = function(path) {
	try{
	    var stat = File.stat.apply(null, arguments);
	}catch(e){
    	var deferred = defer();
    	deferred.reject(e);
    	return deferred.promise;
	}
    stat.isFile = function() {
        return File.isFile(path);
    }
    if(!stat.mtime){
    	var deferred = defer();
    	deferred.reject("File not found");
    	return deferred.promise;
    }
    return stat;
}

exports.makeTree = File.mkdirs;
exports.makeDirectory = File.mkdir;

exports.open = function(){
	var file = FileIO(this, arguments);
	var array = LazyArray({
		some: function(callback){
			while(true){
				var buffer = file.read(4096);
				if(buffer.length <= 0){
					return;
				}
				if(callback(buffer)){
					return;
				}
			}
		}
	});
	for(var i in array){
		file[i] = array[i];
	}
	return file;
};
exports.openSync = exports.open;

exports.createWriteStream = function(path, options) {
    options = options || {};
    options.flags = options.flags || "w";
    var flags = options.flags || "w",
        f = File.open(path, flags);
    return {
        writable: true,
        write: function() {
            var deferred = defer();
            try {
                f.write.apply(this, arguments);
                f.flush();
            }
            catch (e) {
                return stream.writable = false;
            }
            deferred.resolve();
            return deferred.promise;
        },
        end: f.close,
        destroy: f.close
    }
}
