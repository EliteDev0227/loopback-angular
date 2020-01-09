'use strict';

module.exports = function(Customer) {

  var app = require('../../server/server');

	Customer.observe('after save', function(ctx, next) {
	  //see if customer belongs to survey
	  if (!ctx.instance)
	  	return next();

	  app.models.Order.findById(ctx.instance.last_order_id, function(err, order){
	  	if (err || !order)
	  		return next();
  		app.models.Survey.find({where:{
  			after_type : order.type,
		  	order_min : {lte : ctx.instance.order_cnt},
		  	order_max : {gte : ctx.instance.order_cnt},
		  	exchange_min : {lte : ctx.instance.exchange_cnt},
		  	exchange_max : {gte : ctx.instance.exchange_cnt},
		  	refund_min : {lte : ctx.instance.refund_cnt},
		  	refund_max : {gte : ctx.instance.refund_cnt},
		  	survey_min : {lte : ctx.instance.survey_cnt},
		  	survey_max : {gte : ctx.instance.survey_cnt},
		  	value_min : {lte : ctx.instance.avg_value},
		  	value_max : {gte : ctx.instance.avg_value}
		  }}, function(err, items){
		  	console.log('checking survey');
		  	if (err)
		  	{
		  		console.log('err', err);
		  		return next();
		  	}
		  	var answer_array = [];
		  	for (var i = 0; i < items.length; i++) {
		  		var survey_id = items[i].id;
		  		var j = 0;
		  		var answers = items[i].answers();
		  		console.log('survey id', items[i].id);
		  		console.log('answers', answers);
		  		for (j = 0; j < answers.length; j++)
		  			if (answers[j].customer_id == ctx.instance.id && answers[j].concerned_order_id == ctx.instance.last_order_id)
		  				break;
		  		if (j == answers.length) {
		  			answer_array.push({
				  			survey_id : survey_id,
				  			customer_id : ctx.instance.id,
				  			concerned_order_id : ctx.instance.last_order_id,
				  			white_date : new Date()
		  				});
		  		}
		  	}
		  	console.log('answer_array', answer_array);
			app.models.Answer.create(answer_array, function(err, inst){
				if (err)
					console.log('err', err);
				console.log('inst', inst);
				return next();
			});
		  });
	  })


	});

	
	Customer.beforeRemote('find', function(ctx, unused, next) {
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
