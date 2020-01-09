'use strict';

module.exports = function(Survey) {

  var app = require('../../server/server');



	Survey.observe('after save', function(ctx, next) {
	  if (!ctx.isNewInstance) {
	    return next();
	  }

	  // //for new survey, add answer records
	  // app.models.Customer.find({where:{
	  // 	order_cnt : {between : [ctx.instance.order_min, ctx.instance.order_max]},
	  // 	survey_cnt : {between : [ctx.instance.survey_min, ctx.instance.survey_max]},
	  // 	exchange_cnt : {between : [ctx.instance.exchange_min, ctx.instance.exchange_max]},
	  // 	refund_cnt : {between : [ctx.instance.refund_min, ctx.instance.refund_max]},
	  // 	avg_value : {between : [ctx.instance.value_min, ctx.instance.value_max]},
	  // 	}}, function(err, items){
	  // 	if (err)
	  // 		return next();
	  // 	var answers = [];
	  // 	for (var i = 0; i < items.length; i++) {
	  // 		answers.push({
	  // 			survey_id : ctx.instance.id,
	  // 			customer_id : items[i].id,
	  // 			concerned_order_id : items[i].last_order_id,
	  // 			white_date : new Date()
	  // 		});
	  // 	}
	  // 	ctx.instance.updateAttributes({user_cnt : items.length}, function(err, inst){

	  // 	});
	  // 	app.models.Answer.create(answers, function(err, items){
	  // 		return next();
	  // 	})
	  // })
	});

	Survey.beforeRemote('find', function(ctx, unused, next) {
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
