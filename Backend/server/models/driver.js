'use strict';

module.exports = function(Driver) {
  var app = require('../../server/server');
  var common = require('../../server/common');


	Driver.observe('after save', function(ctx, next) {
		if (!ctx.isNewInstance) {
			if (ctx.instance && ctx.instance.deleted && ctx.instance.deleted == 1) {
				app.models.User.deleteAll({driver_id : ctx.instance.id}, function(err, inst){
					if (err)
						console.log('delete user error');
					else
						console.log('deleted user');
				})
			}
			return next();
		}

		app.models.user.create({
			username : ctx.instance.phone,
			password : ctx.instance.password,
			driver_id : ctx.instance.id
		}, function(err, user){
			if (!err)
				console.log(user);
			else
				console.log(err);
			return next();

		});


		// if (ctx.instance && ctx.instance.id && ctx.instance.phone && ctx.instance.password) {
		// 	app.models.user.find({where : {driver_id : ctx.instance.id}}, function(err, users) {
		// 		if (err || users.length == 0) {
		// 		}
		// 		else {
		// 			users[0].updateAttributes({
		// 				username : ctx.instance.phone,
		// 				password : ctx.instance.password,
		// 				driver_id : ctx.instance.id
		// 			}, function(err, user){

		// 			});	
		// 		}
		// 	});
		// }
	});

	Driver.setDriverQueueId = function(id, queue_id) {
		Driver.findById(id, function(err, driver){
			if (err || driver == null) {
				console.log(err);
				return;
			}
			var update_data;
			if (queue_id == -1) {
				update_data = {
					queue_id : queue_id,
					status : common.DriverStatus.NO_QUEUE
				};
			}
			else {
				update_data = {
					queue_id : queue_id,
					status : common.DriverStatus.ASSIGNED
				};
			}
			driver.updateAttributes(update_data, function(err, inst){
			});
		});
	}

	Driver.stopDriver = function(id) {
		Driver.setDriverQueueId(id, -1);
	}

	Driver.unassigned = function(cb) {
		Driver.find({where: {queue_id: -1, deleted : 0}}, function(err, orders){
			if (!err)
				return cb(null, orders);
			return cb(null, []);
		});
	  };

	Driver.remoteMethod(
		'unassigned', {
		  http: {path: '/unassigned',verb: 'get'},
		  accepts: [ ],
		  returns: {root : true,type: 'Array'}
		}
	);

	Driver.changePassword = function(id, phone, password, cb) {
		Driver.findById(id, function(err, driver) {
			if (err || !driver)
				return cb(err, null);

			app.models.user.find({where : {driver_id : id}}, function(err, users) {
				if (err || users.length == 0) {
					console.log('no user');

				}
				else {
					console.log(users[0]);
					users[0].updateAttributes({
						username : phone,
						password : password
					}, function(err, user){

					});	
				}
				return cb(null, {});
			});
		})
	}

	Driver.remoteMethod(
		'changePassword', {
		  http: { path: '/changePassword', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' },
		  	{arg: 'phone', type: 'string' },
		  	{arg: 'password', type: 'string' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);

	Driver.getTotalWallet = function (cb) {
	  var ds = app.datasources.mysqldb;
	  var sql = "SELECT SUM(order_wallet) as total_wallet FROM driver;"; // here you write your sql query.

	  ds.connector.execute(sql, [], function (err, sum) {
	    if (err) {
	      cb(err, null);
	    } else {
	      cb(null, sum);
	    }

	  });

	};

	Driver.remoteMethod(
	  'getTotalWallet', {
	    http: {
	      path: '/getTotalWallet',
	      verb: 'get'
	    },
	    returns: {
	      root: true,
	      type: 'object'
	    }
	  }
	);

	Driver.beforeRemote('find', function(ctx, unused, next) {
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
