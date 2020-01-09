'use strict';

var common = require('../common.js');
var firebase = require('../firebase.js');
module.exports = function(Queue) {

  var app = require('../../server/server');

	Queue.beforeRemote('find', function(ctx, unused, next) {
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

	Queue.execute = function(id, driver_id, orders, ignore_early, cb) {
		console.log(ignore_early);
		var settings = {};
		//load setting
		app.models.Setting.find({}, function(err, settingItems){
			for (var i = 0; i < settingItems.length; i++)
				settings[settingItems[i].key] = settingItems[i].value;

					//update queue driver_id and status to running
			Queue.findById(id, function(err, instance){
				if (err)
					return cb(null, {});
				//first, get driver
				app.models.Driver.findById(driver_id, function(err, driver){
					if (err)
						return cb(null, {});
					if (!driver.online)
						return cb(null, {status : 0, msg : "Driver is offline!"});
					//check setting
					if (driver.vehicle_type == "BIKE" && orders.length > settings.ORDERS_PER_BIKE)
						return cb(null, {status : 0, msg : "Number of Orders per Bike exceeded!"});
					if (driver.vehicle_type == "CAR" && orders.length > settings.ORDERS_PER_CAR)
						return cb(null, {status : 0, msg : "Number of Orders per Bike exceeded!"});
					if (driver.vehicle_type == "BIKE" && !instance.zone.bike_able)
						return cb(null, {status : 0, msg : "Unable to travel by Bike!"});
					var sum = 0;
					for (var i = 0; i < orders.length; i++)
						sum += orders[i].value;
					if (sum > settings.CASH_PER_DRIVER)
						return cb(null, {status : 0, msg : "Cash per Driver exceeded!"});

					//if driver already assigned
					if (driver.queue_id > 0) {
						return cb(null, {status : 0, msg : "Driver has got queue running already!"});
					}

					//calc time
					//calc order time
					var sum = 0;
//					var order_avg_time = (Number(settings.TIME_PER_ORDER) + Number(settings.TIME_PER_EXCHANGE) + Number(settings.TIME_PER_REFUND)) / 3;
					var order_times = [0, Number(settings.TIME_PER_ORDER), Number(settings.TIME_PER_EXCHANGE), Number(settings.TIME_PER_REFUND)];
					for (var i = 0; i < orders.length; i++) {
						if (orders[i].type == common.OrderType.NEW_ORDER)
							sum += Number(settings.TIME_PER_ORDER);
						else if (orders[i].type == common.OrderType.EXCHANGE)
							sum += Number(settings.TIME_PER_EXCHANGE);
						else if (orders[i].type == common.OrderType.REFUND)
							sum += Number(settings.TIME_PER_REFUND);
					}
					//calc travel time
					console.log('warehouse pos', settings.WAREHOUSE_POS);
					var origins = settings.WAREHOUSE_POS + "|";
					var destinations = orders[0].address.area.google_pin + "|";
					var mode = "";
					for (var i = 0; i < orders.length - 1; i++) {
						var area1 = orders[i].address.area;
						var area2 = orders[i+1].address.area;
						origins += area1.google_pin + "|";
						destinations += area2.google_pin + "|";
					}
					if (driver.vehicle_type == "BIKE")
						mode = "bicycling";
					else
						mode = "driving";

					//test data
					// travel_cnt = 2;
					// origins = "11201|11207";
					// destinations = "11207|11201";
					// mode = "bicycling";
					var check_time = instance.start_time;
					console.log('check_time', check_time);

					app.models.GeoAPI.getDuration(origins, destinations, mode, function(err,resp, inst){
						console.log(resp);
// 						if (err || resp.status != 'OK') {
// 							return cb(null, {status : 0, msg : "Address not reachable!"});
// 						}

// 						for (var i = 0; i < orders.length; i++) {
// 							console.log(resp.rows[i].elements[i]);
// 							if (resp.rows[i].elements[i].status == 'OK') {
// 								sum += (resp.rows[i].elements[i].duration.value + 59) / 60;	//second -> minutes
// //								check_time += resp.rows[i].elements[i].duration.value;
// 								check_time = common.addTime(check_time, resp.rows[i].elements[i].duration.value);
// 								if (orders[i].delivery_time_to && check_time > orders[i].delivery_time_to) {
// 									return cb(null, {status : 0, msg : "Order will be arrived later."});
// 								}
// 								if (!ignore_early && orders[i].delivery_time_from && check_time < orders[i].delivery_time_from) {
// 									return cb(null, {status : -1, msg : "Order #" + orders[i].id + " will be arrived early."});
// 								}
// 								app.models.Order.updateAll({id : orders[i].id}, {expected_time : check_time}, function(err, info){

// 								});
// 								check_time = common.addTime(check_time, order_times[orders[i].type] * 60);
// 								console.log(check_time);
// 							}
// 							else {
// 								return cb(null, {status : 0, msg : "Address not reachable!"});
// 							}
// 						}
// 						//now, finally update execute_time
// 						instance.updateAttributes({execute_time : sum}, function(err, instance) {
// 						});

						//update driver's queue_id
						app.models.Driver.setDriverQueueId(driver_id, instance.id);
						driver.updateAttributes({cur_order_id : null, step : null}, function(err, info){

						});


						//update attribute driver_id , status
						instance.updateAttributes({driver_id : driver_id, status : common.QueueStatus.STARTED}, function(err, instance){
							if (err)
								return cb(null, {status : 0, msg:""});

							//update order's travel_order
							for (var i = 0; i < orders.length; i++) {
								app.models.Order.updateAll({id : orders[i].id}, {travel_order : i}, function(err, info){
								})
							}

							//update orders queue_id and status to ASSIGNED
							var id_array  = [];
							for (var i = 0; i < orders.length; i++)
								id_array.push({id: orders[i].id});
							
							app.models.Order.updateAll({or: id_array}, {queue_id : id, driver_id : driver_id, status : common.OrderStatus.ASSIGNED}, function(err, info){
								//see if all orders in queue are packed
								app.models.Order.find({where:{queue_id : id, pack_status : common.OrderPackStatus.NOT_PACKED}}, function(err, orders){

									if (!err && orders.length == 0) {
										//for driver app, send socket message
										if (common.socketList[driver_id])
											common.socketList[driver_id].emit('queue_assigned', {type : "queue_assigned"});
										else {
											app.models.Driver.findById(driver_id, function(err, driver){
												if (driver && driver.fcm) {
													firebase.messaging().sendToDevice(driver.fcm, {
														data: {
															string: 'notification',
															body: "New Queue is Assigned."
														}
													}).then(function (response) {
														// See the MessagingDevicesResponse reference documentation for
														// the contents of response.
														console.log('Successfully sent message:', response);
													})
													.catch(function (error) {
														console.log('Error sending message:', error);
													});
												}
												else {
													console.log('no fcm');
												}
											});
										}
									}
								});

								cb(null, {status : 1, id : id, driver_id : driver_id, orders : orders});
							});
						});

					});

					
				});
			});
		});

	  };

	Queue.remoteMethod(
		'execute', {
		  http: { path: '/execute', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' },
		  	{arg: 'driver_id', type: 'number' },
		  	{arg: 'orders', type: 'any' },
		  	{arg: 'ignore_early', type: 'boolean' }
		  ],
		  returns: { root : true, type: 'Object' }
		}
	);

	Queue.stop = function(id, cb) {
		//update queue driver_id to -1 and status to stopped
		Queue.findById(id, function(err, instance){
			if (!err)
			{
				if (instance.status != common.QueueStatus.STARTED) {
					return cb(null, {msg : 'You can not stop queue!'});
				}
				app.models.Driver.stopDriver(instance.driver_id);
				var driver_id = instance.driver_id;
				instance.updateAttributes({driver_id : -1, status : common.QueueStatus.STOPPED}, function(err, instance){
					if (err) {
						console.log(err);
						return cb(null, {msg : 'Stop Queue Failed'});
					}

					//update orders(queue_id = id) queue_id to -1 and status to NOT_ASSIGNED
					app.models.Order.updateAll({queue_id: id, or : [{status : common.OrderStatus.ASSIGNED}, {status : common.OrderStatus.IN_PROGRESS}]}, {queue_id : -1, driver_id : -1, status : common.OrderStatus.NOT_ASSIGNED}, function(err, info, count){
						//for driver app, send socket message
						if (common.socketList[driver_id])
							common.socketList[driver_id].emit('queue_stopped', {type : 'queue_stopped'});
						else {
							app.models.Driver.findById(driver_id, function(err, driver){
								if (!err && driver) {
									if (driver.fcm) {
										firebase.messaging().sendToDevice(driver.fcm, {
											data: {
												string: 'notification',
												body: "Queue is stopped"
											}
										}).then(function (response) {
											// See the MessagingDevicesResponse reference documentation for
											// the contents of response.
											console.log('Successfully sent message:', response);
										})
										.catch(function (error) {
											console.log('Error sending message:', error);
										});
									}
									else {
										console.log('no fcm');
									}
								}

							})

						}

						return cb(null, {id : id});
					});
				});
			}
			else
				return cb(null, {});
		})
	  };
	Queue.remoteMethod(
		'stop', {
		  http: { path: '/stop', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);

	Queue.getDates = function (cb) {
	  var ds = app.datasources.mysqldb;
	  var sql = "SELECT DISTINCT(queue_date)  FROM queue WHERE status < 4 AND deleted = 0 ORDER BY queue_date asc"; // here you write your sql query.

	  ds.connector.execute(sql, [], function (err, dates) {

	    if (err) {
	      cb(err, null);
	    } else {
	      cb(null, dates);
	    }

	  });

	};

	Queue.remoteMethod(
	  'getDates', {
	    http: {
	      path: '/getDates',
	      verb: 'get'
	    },
	    returns: {
	      root: true,
	      type: 'object'
	    }
	  }
	);



};
