'use strict';

module.exports = function(DriverApi) {
  var app = require('../../server/server');
  var common = require('../../server/common');



	DriverApi.logIn = function(fcm, username, password, cb) {
		app.models.User.login({username: username, password: password}, function (err, token) {
			if (err) {
				return cb(null, {status:0, msg:"Invalid Username and Password"});
			}
			console.log('new driver login with fcm', fcm);
			app.models.User.findById(token.userId, function(err, user){
				if (!err && user.driver_id) {
					app.models.Driver.updateAll({id : user.driver_id}, {fcm : fcm}, function(err, info){

					});
				}
			})
			return cb(null, {status:1, msg:"Success", token:token.id});
		});
	};

	DriverApi.remoteMethod(
		'logIn', {
		  http: {path: '/logIn',verb: 'post'},
		  accepts: [
	        {arg: "fcm", type: "string"},
	        {arg: "username", type: "string"},
	        {arg: "password", type: "string"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.logOut = function(options, cb) {
		console.log('log out received');
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, {status:0, msg:"No Driver"});
			app.models.User.logout(options.accessToken.id, function (err) {
				if (err) {
					return cb(null, {status:0, msg:"Logout Failed"});
				}
				app.models.Driver.updateAll({id : info}, {online : 0, fcm : null}, function(err, info){
				});
				return cb(null, {status:1, msg:"Logout Success"});
			});
		});

	};

	DriverApi.remoteMethod(
		'logOut', {
		  http: {path: '/logOut',verb: 'get'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.getDriverId = function(options, next) {
		app.models.user.findById(options.accessToken.userId, function(err, user) {
			if (!err) {
				if (!user.driverId)
					next(null, user.driver_id);
				else {
					var error = new Error();
					error.status = 500;
					error.messsage = "Not driver!";
					next(error, null);
				}
			}
			else
				next(err, null);
		});
	}

	DriverApi.getMyInfo = function(options, cb) {
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Driver.findById(info, function(err, driver){
				if (!err)
					return cb(null, driver);
				else {
					return cb(err, null);
				}
			})
		});
	  };

	DriverApi.remoteMethod(
		'getMyInfo', {
		  http: {path: '/getMyInfo',verb: 'get'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.getMyQueue = function(options, cb) {
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Driver.findById(info, function(err, driver){
				if (err) {
					return cb(err, null);
				}				
				if (driver.queue_id != -1 && driver.status != common.DriverStatus.NO_QUEUE) {
					app.models.Queue.findById(driver.queue_id, function(err, queue){
						if (!err) {
							app.models.Order.find({where:{queue_id : driver.queue_id, pack_status : common.OrderPackStatus.NOT_PACKED}}, function(err, orders){
								if (err || orders.length > 0) {
									return cb(null, null);
								}
								else {
									return cb(null, queue);
								}
							})
						}
						else {
							return cb(err, null);
						}
					})
				}
				else {
					return cb(null, null);
				}
			})
		});
	  };

	DriverApi.remoteMethod(
		'getMyQueue', {
		  http: {path: '/getMyQueue',verb: 'get'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.getMyFinance = function(options, cb) {
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Wallet.find({where : {driver_id : info}}, function(err, wallets){
				if (!err)
					cb(null, wallets);
				else{
					return cb(err, null);
				}
			})
		})
	  };

	DriverApi.remoteMethod(
		'getMyFinance', {
		  http: {path: '/getMyFinance',verb: 'get'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.packageReceived = function(orders, options, cb) {
		console.log(orders);
		var error = new Error();
		error.status = 500;
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not logged in'});

			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver) {
					return cb(err, {status : 0, msg : 'Unknown driver!'});
				}

				if (driver.status != common.DriverStatus.ACCEPTED) {
					return cb(err, {status : 0, msg : 'You can not receive packages!'});
				}


				//check if all orders are assigned and packed
				var ids = [];
				for (var i = 0; i < orders.length; i++) {
					if (orders[i].received == 1) {
						ids.push(orders[i].id);
					}
				}
				app.models.Order.find({where : {id : {inq : ids}, status : common.OrderStatus.ASSIGNED, pack_status : common.OrderPackStatus.PACKED}}, function(err, items) {
					if (err || items.length != ids.length) {
						return cb(err, {status : 0, msg : 'Set Packages received : You have unpacked or unassigned orders'});
					}

					if (ids.length == 0) {
						DriverApi.rejectQueue(options, cb);
						return;
					}

					//update driver
					driver.updateAttribute('status', common.DriverStatus.PACK_RECEIVED, function(err, info) {
						if (err || !info) {
							return cb(err, {status : 0, msg : 'Set Packages received : Failed'});
						}

						//set orders assigned/unassigned
						for (var i = 0; i < orders.length; i++) {
							if (orders[i].received == 1) {
								app.models.Order.updateAll({id : orders[i].id, status : common.OrderStatus.ASSIGNED, pack_status : common.OrderPackStatus.PACKED},  
									{status : common.OrderStatus.IN_PROGRESS, pack_status : common.OrderPackStatus.SENT}, function(err, info){

								});
							}
							else {
								app.models.Order.updateAll({id : orders[i].id}, 
									{status : common.OrderStatus.FAILED_ON_DELIVERY, queue_id : -1, driver_id : -1, reason:"Not received by driver"}, function(err, info){

								});
							}		
						}
						cb(null, {status : 1, msg : 'Success'});
					});

				});
			})
		})
	  };

	DriverApi.remoteMethod(
		'packageReceived', {
		  http: {path: '/packageReceived',verb: 'post'},
		  accepts: [
		  	{arg: "orders", type: "Array"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.doneOrder = function(order_id, options, cb) {

		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Order.markArrived(order_id, true, function(err, res) {
				if (err || res.status) {
					cb(err, null);
				}
				else
					cb(null, {status:1, msg:"Order Received!"});
			})
		})
	  };

	DriverApi.remoteMethod(
		'doneOrder', {
		  http: {path: '/doneOrder',verb: 'post'},
		  accepts: [
		  	{arg: "order_id", type: "number"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.cancelOrder = function(order_id, options, cb) {
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Order.findById(order_id, function(err, order){
				if (err) {
					return cb(err, null);
				}
				if (order.status == common.OrderStatus.IN_PROGRESS) {
					order.updateAttributes({status : common.OrderStatus.FAILED_ON_DELIVERY,
						reason : 'Customer not answering'} , function(err, info){
						if (err) {
							return cb(err, null);
						}
						else
							return cb(null, {status:1, msg:"Order Cancelled!"});
					})
				}
				else {
					return cb(null, {status:1, msg:"Order must be in progress!"});
				}
			})
		})
	  };

	DriverApi.remoteMethod(
		'cancelOrder', {
		  http: {path: '/cancelOrder',verb: 'post'},
		  accepts: [
		  	{arg: "order_id", type: "number"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.uploadAddressLongLat = function(address_id, long, lat, options, cb) {
		var error = new Error();
		error.status = 500;
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Address.findById(address_id, function(err, address){
				if (err) {
					return cb(err, null);
				}
				address.updateAttributes({Long : long, Lat : lat}, function(err, info){
					if (err) {
						cb(err, null);
					}
					else
						cb(null, info);
				})
			})
		})
	  };

	DriverApi.remoteMethod(
		'uploadAddressLongLat', {
		  http: {path: '/uploadAddressLongLat',verb: 'post'},
		  accepts: [
		  	{arg: "address_id", type: "number"},
		  	{arg: "long", type: "string"},
		  	{arg: "lat", type: "string"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.uploadAddressPicture = function(address_id, picture, options, cb) {
		var error = new Error();
		error.status = 500;
		DriverApi.getDriverId(options, function(err, info) {
			if (err || !info)
				return cb(err, null);
			app.models.Address.findById(address_id, function(err, address){
				if (err) {
					return cb(err, null);
				}
				address.updateAttributes({picture : picture}, function(err, info){
					if (err) {
						cb(err, null);
					}
					else
						cb(null, info);
				})
			})
		})
	  };

	DriverApi.remoteMethod(
		'uploadAddressPicture', {
		  http: {path: '/uploadAddressPicture',verb: 'post'},
		  accepts: [
		  	{arg: "address_id", type: "number"},
		  	{arg: "picture", type: "string"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.setOnline = function(online, options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});
				driver.updateAttribute('online', online, function(err, info) {
					if (err)
						return cb(null, {status : 0, msg : 'Set Online status' });
					return cb(null, {status : 1, msg : 'Set Online = ' + online });
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'setOnline', {
		  http: {path: '/setOnline',verb: 'post'},
		  accepts: [
		  	{arg: "online", type: "number"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.acceptQueue = function(options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});

				if (driver.status != common.DriverStatus.ASSIGNED) {
					return cb(err, {status : 0, msg : 'You cannot accept queue!'});
				}

				driver.updateAttribute('status', common.DriverStatus.ACCEPTED, function(err, info) {
					if (err || !info)
						return cb(err, {status : 0, msg : 'Queue Accept : Failed!'})

					app.models.Queue.findById(driver.queue_id, function(err, queue){
						if (!err) {
							queue.updateAttribute('status', common.QueueStatus.RUNNING, function(err, info){

							});
						}
					})

					return cb(null, {status : 1, msg : 'Queue Accepted'});
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'acceptQueue', {
		  http: {path: '/acceptQueue',verb: 'post'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.rejectQueue = function(options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});

				if (driver.status != common.DriverStatus.ASSIGNED && driver.status != common.DriverStatus.ACCEPTED) {
					return cb(err, {status : 0, msg : 'You cannot reject queue!'});
				}

				var queue_id = driver.queue_id;

				driver.updateAttributes({status : common.DriverStatus.NO_QUEUE, queue_id : -1}, function(err, info) {
					if (err || !info)
						return cb(err, {status : 0, msg : 'Queue Reject : Failed!'})

					app.models.Queue.findById(queue_id, function(err, queue){
						if (!err && queue) {
							queue.updateAttribute('status', common.QueueStatus.STOPPED, function(err, info){

							});
							app.models.Order.updateAll({queue_id : queue_id, driver_id : driver_id}, {status : common.OrderStatus.ASSIGNED, driver_id : -1, reason : "Rejected By Driver"}, function(err, info) {

							});
						}
					})

					return cb(null, {status : 1, msg : 'Queue Rejected'});
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'rejectQueue', {
		  http: {path: '/rejectQueue',verb: 'post'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.finishQueue = function(options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});

				if (driver.status != common.DriverStatus.PACK_RECEIVED) {
					return cb(err, {status : 0, msg : 'You cannot finish queue!'});
				}

				var old_queue_id = driver.queue_id;;

				driver.updateAttributes({status : common.DriverStatus.NO_QUEUE, queue_id : -1}, function(err, info) {
					if (err || !info)
						return cb(err, {status : 0, msg : 'Queue Finish : Failed!'})

					app.models.Queue.findById(old_queue_id, function(err, queue){
						if (!err) {
							queue.updateAttributes({status : common.QueueStatus.FINISHED, cur_order_id : null, step : null}, function(err, info){

							});
						}
					})

					return cb(null, {status : 1, msg : 'Queue Finished'});
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'finishQueue', {
		  http: {path: '/finishQueue',verb: 'post'},
		  accepts: [
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.setCurOrder = function(order_id, options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});

				driver.updateAttributes({cur_order_id : order_id, step : 1}, function(err, info) {
					if (err || !info)
						return cb(err, {status : 0, msg : 'Set Cur Order : Failed!'})
					return cb(null, {status : 1, msg : 'Set Cur Order : Success!'});
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'setCurOrder', {
		  http: {path: '/setCurOrder',verb: 'post'},
		  accepts: [
	        {arg: "order_id", type: "number"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DriverApi.setStep = function(step, options, cb) {
		DriverApi.getDriverId(options, function(err, driver_id) {
			if (err || !driver_id)
				return cb(err, {status : 0, msg : 'Not Logged In!'});
			app.models.Driver.findById(driver_id, function(err, driver) {
				if (err || !driver)
					return cb(err, {status : 0, msg : 'Unknown driver!'});

				driver.updateAttribute('step', step, function(err, info) {
					if (err || !info)
						return cb(err, {status : 0, msg : 'Set Step : Failed!'})
					return cb(null, {status : 1, msg : 'Set Step : Success!'});
				});
			});
		})
	  };

	DriverApi.remoteMethod(
		'setStep', {
		  http: {path: '/setStep',verb: 'post'},
		  accepts: [
	        {arg: "step", type: "number"},
	        {arg: "options", type: "object", http: "optionsFromRequest"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);
};
