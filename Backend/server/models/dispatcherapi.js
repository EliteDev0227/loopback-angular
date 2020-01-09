'use strict';

module.exports = function(DispatcherApi) {
  var app = require('../../server/server');
  var common = require('../../server/common');
  var firebase = require('../../server/firebase');

	DispatcherApi.getOrders = function(cb) {
		// var where_filter;
		// if (type == 1) {
		// 	where_filter = {pack_status : common.OrderPackStatus.NOT_PACKED};
		// }
		// if (type == 2) {
		// 	where_filter = {pack_status : common.OrderPackStatus.PACKED};
		// }
		// if (type == 3) {
		// 	where_filter = {pack_status : common.OrderPackStatus.REJECTED};
		// }
		// if (type == 4) {
		// 	where_filter = {status : common.OrderStatus.FAILED_ON_DELIVERY};
		// }
		// if (type == 5) {
		// 	where_filter = {pack_status : common.OrderPackStatus.SENT, status : common.OrderStatus.IN_PROGRESS};
		// }
		app.models.Order.find({where : {status : {nin : [common.OrderStatus.DELIVERED]}}}, function(err, orders){
			if (err)
				return cb(err, null);
			var unpacked_list = [], packed_list = [], rejected_list = [], failed_list = [], sent_list = [], cancelled_list = [];
			for (var i = 0; i < orders.length; i++) {
				if (orders[i].status == common.OrderStatus.CANCELLED) {
					if (orders[i].pack_status != common.OrderPackStatus.CANCELLED)
						cancelled_list.push(orders[i]);
				}
				else if (orders[i].pack_status == common.OrderPackStatus.NOT_PACKED)
					unpacked_list.push(orders[i]);
				else if (orders[i].pack_status == common.OrderPackStatus.PACKED)
					packed_list.push(orders[i]);
				else if (orders[i].pack_status == common.OrderPackStatus.REJECTED)
					rejected_list.push(orders[i]);
				else {
					if (orders[i].status == common.OrderStatus.FAILED_ON_DELIVERY)
						failed_list.push(orders[i]);
					else if (orders[i].status == common.OrderStatus.IN_PROGRESS)
						sent_list.push(orders[i]);
				}
			}
			return cb(null, {cancelled : cancelled_list, unpacked: unpacked_list, packed : packed_list, rejected : rejected_list, failed : failed_list, sent : sent_list});
		})
	  };

	DispatcherApi.remoteMethod(
		'getOrders', {
		  http: {path: '/getOrders',verb: 'get'},
		  accepts: [
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DispatcherApi.doneOrder = function(order_id, items, cb) {
		var cnt = 0;
		for (var i = 0; i < items.length; i++) {
			if (items[i].status == 1)
				cnt++;
			app.models.Item.updateAll({id : items[i].id}, {status : items[i].status}, function(err, info){
			});
		}
		app.models.Order.findById(order_id, function(err, order) {
			if (err || !order) {
				console.log(err, order);
				return cb(err, {status:0, msg:'Order not found!'});
			}
			var status = common.OrderPackStatus.PACKED;
			if (cnt != items.length) {
				status = common.OrderPackStatus.REJECTED;
			}
				//see if all orders in queue are packed
				order.updateAttribute('pack_status', status, function(err, info){
					if (err)
						return cb(err, {status:0,msg:'Update status failed!'});

					if (order.driver_id && order.queue_id) {
						app.models.Order.find({where:{queue_id : order.queue_id, pack_status : common.OrderPackStatus.NOT_PACKED}}, function(err, orders){
							console.log('orders', orders);
							if (!err && orders.length == 0) {
								//for driver app, send socket message
								if (common.socketList[order.driver_id])
									common.socketList[order.driver_id].emit('queue_assigned', {type : "queue_assigned"});
								else {
									app.models.Driver.findById(order.driver_id, function(err, driver){
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
					}		

					if (status == common.OrderPackStatus.PACKED)
						return cb(null, {status:1,msg:'Order Packed'});
					else
						return cb(null, {status:1,msg:'Order Rejected'});
				})

		})
	  };

	DispatcherApi.remoteMethod(
		'doneOrder', {
		  http: {path: '/doneOrder',verb: 'post'},
		  accepts: [
	        {arg: "order_id", type: "number"},
	        {arg: "items", type: "any"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

	DispatcherApi.cancelOrder = function(order_id, cb) {
		app.models.Order.findById(order_id, function(err, order) {
			if (err || !order) {
				console.log(err, order);
				return cb(err, {status:0, msg:'Order not found!'});
			}
			if (order.status != common.OrderStatus.CANCELLED) {
				return cb(err, {status:0, msg:"It's not cancelled order!"});	
			}
			order.updateAttribute('pack_status', common.OrderPackStatus.CANCELLED, function(err, info){
				if (err)
					return cb(err, {status:0,msg:'Order Packages Cancellation failed!'});
				return cb(null, {status:1,msg:'Order Packages cancelled!'});
			})
		})
	  };

	DispatcherApi.remoteMethod(
		'cancelOrder', {
		  http: {path: '/cancelOrder',verb: 'post'},
		  accepts: [
	        {arg: "order_id", type: "number"}
	        ],
		  returns: {root : true,type: 'any'}
		}
	);

};
