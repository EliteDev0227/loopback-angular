'use strict';

module.exports = function(Zone) {

	Zone.saveBikeable = function(data, cb) {
		var ids_array = [];
		for (var i = 0; i < data.length; i++)
			if (data[i].bike_able)
				ids_array.push({id : data[i].id});

		Zone.updateAll({}, {bike_able : 0}, function(err, info){
			if (err || ids_array.length == 0)
				return cb(null, {});

			Zone.updateAll({or: ids_array}, {bike_able : 1}, function(err, info){
				return cb(null, {});
			})
		})


	  };

	Zone.remoteMethod(
		'saveBikeable', {
		  http: { path: '/saveBikeable', verb: 'post' },
		  accepts: [
		  	{arg: 'data', type: 'any' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);


	Zone.beforeRemote('find', function(ctx, unused, next) {
		if (!ctx.args.filter)
			ctx.args.filter = {};
		if (!ctx.args.filter.where)
			ctx.args.filter.where = {};
		ctx.args.filter.where = {
			...ctx.args.filter.where,
			deleted : 0
		};
		next();
	});

};
