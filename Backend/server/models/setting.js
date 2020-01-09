'use strict';

module.exports = function(Setting) {

	Setting.saveAll = function(data, cb) {
		Setting.destroyAll({1:1}, function(err, info){
			if (err)
				return cb(null, {msg : 'Save Setting Failed!'});
			Setting.create(data, function(err, models){
				if (err)
					console.log(err);
				return cb(null, {});
			})
		});
	  };

	Setting.remoteMethod(
		'saveAll', {
		  http: { path: '/saveAll', verb: 'post' },
		  accepts: [
		  	{arg: 'data', type: 'any' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);


};
