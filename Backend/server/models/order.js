'use strict';
var common = require('../common.js');

module.exports = function(Order) {

  var app = require('../../server/server');

	Order.beforeRemote('find', function(ctx, unused, next) {
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
	
	Order.observe('before save', function(ctx, next) {
	  if (!ctx.isNewInstance) {
	  	if (ctx.data) {
	  		if (ctx.data.value)
			  	ctx.data['pack_status'] = common.OrderPackStatus.NOT_PACKED;
	  	}
	    return next();
	  }

	  //for New One
	  ctx.instance.created_date = new Date();
	  //calc value;
	  var items = ctx.instance.items();
	  var sum = 0;
	  for (var i = 0; i < items.length; i++)
	  {
	  	if (items[i].type == 1)
	  		sum += items[i].price;
	  	if (items[i].type == 2) {
	  		sum -= items[i].price;
	  		app.models.Item.updateAll({id : items[i].org_id}, {refund : 1}, function(err, info) {

	  		});
	  	}
	  }
	  ctx.instance.value = sum;
	  next();
	});

	Order.observe('after save', function(ctx, next) {
	  app.io.emit('new_order');
	  if (!ctx.isNewInstance) {
	    return next();
	  }

	  //for items, set order id and save
	  var items = ctx.instance.items();
	  for (var i = 0; i < items.length; i++)
	  {
	  	items[i].order_id = ctx.instance.id;
	  	app.models.Item.create(items[i],function(err, instance){

	  	});
	  }

	  next();
	});

	Order.markArrived = function(id, api, cb) {
		Order.findById(id, function(err, instance){
			if (err) {				
				return cb(err, null);
			}
			//only in progress orders can be delivered
			if (api && instance.status != common.OrderStatus.IN_PROGRESS) {
				return cb(null, {status:0, msg:"Order must be in progress!"});
			}
			//set status to DELIVERED
			instance.updateAttributes({status : common.OrderStatus.DELIVERED, delivered_date : new Date()}, function(err, info){
				if (err) {
					return cb(err, null);
				}

				//add wallet entry for this order
				var order_names = ["", "New Order", "Exchange", "Refund"];
				var wallet_data = [{
						type : 1,
						description : order_names[instance.type] + " #" + instance.id + " bonus",
						date : new Date(),
						amount : instance.driver().bonus,
						driver_id : instance.driver_id
					},
					{
						type : 2,
						description : order_names[instance.type] + " #" + instance.id,
						date : new Date(),
						amount : instance.value,
						driver_id : instance.driver_id
				}];
				app.models.Wallet.create(wallet_data, function(err, info){

				});

 				//update customer's no of orders avg_value
				Order.find({where:{customer_id : instance.customer_id, status : common.OrderStatus.DELIVERED}}, function(err, items){
					if (!err) {
						//order_cnt
						var update_data = {
							order_cnt : items.length,
							last_order_id : id
						};
						//avg_value
						if (items.length > 0) {
							var sum = 0;
							for (var i = 0; i < items.length; i++)
								sum += items[i].value;
							update_data['avg_value'] = sum / items.length;
						}
						//type_cnt
						if (instance.type != common.OrderType.NEW_ORDER) {
							Order.find({where:{customer_id : instance.customer_id, type : instance.type, status : common.OrderStatus.DELIVERED}}, function(err, items){
								if (!err) {
									if (instance.type == common.OrderType.EXCHANGE)
										update_data['exchange_cnt'] = items.length;
									if (instance.type == common.OrderType.REFUND)
										update_data['refund_cnt'] = items.length;
									app.models.Customer.findById(instance.customer_id, function(err, item){
										if (!err) {
											item.updateAttributes(update_data, function(err, info){
											});
										}
									})
								}
							});
						}
						else {
									app.models.Customer.findById(instance.customer_id, function(err, item){
										if (!err) {
											item.updateAttributes(update_data, function(err, info){
											});
										}
									})
						}

					}
				});
				return cb(null, {status:1, msg:"Order Arrived!"});
			});
		})
	  };

	Order.remoteMethod(
		'markArrived', {
		  http: { path: '/markArrived', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' },

		  	{arg: 'api', type: 'boolean' }
		  ],
		  returns: {root : true,type: 'Object'}
		}
	);

	Order.updateItems = function(item, cb) {

		Order.findById(item.id, function(err, item) {
			item.updateAttribute('pack_status', common.OrderPackStatus.NOT_PACKED, function(err, info) {
				if (err || !info)
					return (err, null);

				var item_ids = [];
				for (var i = 0; i < item.items.length; i++) {
					item_ids.push(item.items[i].id);
				}

				app.models.Item.destroyAll({and : [{id : {nin : item_ids}}, {order_id : item.id}]}, function(err, info){
					if (info.count > 0) {
						app.models.Item.find({where:{order_id:item.id}}, function(err, items){
							if (err)
								return cb(null, {});
							var sum = 0;
							for (var i = 0; i < items.length; i++)
							{
								if (items[i].type == 1)
									sum += items[i].price;
								if (items[i].type == 2)
									sum -= items[i].price;
							}
							Order.updateAll({id:item.id}, {value : sum}, function(err, info){
								return cb(null, {});
							})
						});
					}
					else
						return cb(null, {});
				})
			})
		});

		
	  };

	Order.remoteMethod(
		'updateItems', {
		  http: { path: '/updateItems', verb: 'post' },
		  accepts: [
		  	{arg: 'item', type: 'Object' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);

	Order.unassigned = function(cb) {
		//update queue driver_id and status to running
		Order.find({where: {status: common.OrderStatus.NOT_ASSIGNED}}, function(err, orders){
			if (!err)
				return cb(null, orders);
			return cb(null, []);
		});
	  };

	Order.remoteMethod(
		'unassigned', {
		  http: {path: '/unassigned',verb: 'get'},
		  accepts: [ ],
		  returns: {arg: 'data',type: 'Array'}
		}
	);

	Order.failed = function(cb) {
		//update queue driver_id and status to running
		Order.find({where: {status: common.OrderStatus.FAILED_ON_DELIVERY}}, function(err, orders){
			if (!err)
				return cb(null, orders);
			return cb(null, []);
		});
	  };

	Order.remoteMethod(
		'failed', {
		  http: {path: '/failed',verb: 'get'},
		  accepts: [ ],
		  returns: {arg: 'data',type: 'Array'}
		}
	);

	Order.rejected = function(cb) {
		//update queue driver_id and status to running
		Order.find({where: {pack_status: common.OrderPackStatus.REJECTED}}, function(err, orders){
			if (!err)
				return cb(null, orders);
			return cb(null, []);
		});
	  };

	Order.remoteMethod(
		'rejected', {
		  http: {path: '/rejected',verb: 'get'},
		  accepts: [ ],
		  returns: {arg: 'data',type: 'Array'}
		}
	);


	Order.hold = function(id, cb) {
		Order.findById(id, function(err, order) {
			if (err || !order)
				return cb(err, null);
			order.updateAttributes({status : common.OrderStatus.NOT_ASSIGNED, pack_status : common.OrderPackStatus.NOT_PACKED, reason : null}, function(err, info){
				if (err)
					return cb(err, null);
				return cb(null, info);
			})
		})
	  };

	Order.remoteMethod(
		'hold', {
		  http: { path: '/hold', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);


	Order.cancel = function(id, cb) {
		Order.findById(id, function(err, order) {
			if (err || !order)
				return cb(err, null);
			order.updateAttributes({status : common.OrderStatus.CANCELLED}, function(err, info){
				if (err)
					return cb(err, null);
				return cb(null, info);
			})
		})
	  };

	Order.remoteMethod(
		'cancel', {
		  http: { path: '/cancel', verb: 'post' },
		  accepts: [
		  	{arg: 'id', type: 'number' }
		  ],
		  returns: { arg: 'status', type: 'Object' }
		}
	);

};
