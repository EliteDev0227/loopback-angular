'use strict';

module.exports = function(Wallet) {

  var app = require('../../server/server');

	Wallet.observe('after save', function(ctx, next) {

		Wallet.find({where:{driver_id : ctx.instance.driver_id}}, function(err, lists){
			if (err)
				return next();
			var sum1 = 0, sum2 = 0;
			for (var i = 0; i < lists.length; i++) {
				if (lists[i].type == 1)
					sum1 += lists[i].amount;
				else
					sum2 += lists[i].amount;
			}
			app.models.Driver.updateAll({id : ctx.instance.driver_id}, {main_wallet : sum1, order_wallet : sum2}, function(err, info){
				return next();
			});
		});
	});

};
