'use strict';

module.exports = function(Answer) {
  var app = require('../../server/server');

	Answer.observe('after save', function(ctx, next) {
		//if first, return
	  if (ctx.isNewInstance) {

	  	//update survey's user_cnt
	  	Answer.find({where:{survey_id : ctx.instance.survey_id}}, function(err, items){
	  		if (!err)
	  		{
		  		app.models.Survey.updateAll({id : ctx.instance.survey_id},{user_cnt : items.length}, function(err, info){
				});
	  		}
	  	})
	    return next();
	  }

	  //if update answer, return
	  if (ctx.instance.status == 1)
	  	return next();
	  //if new answer, set status to 1
	  ctx.instance.updateAttributes({status : 1}, function(err, inst){
	  	//update survey's respondent_cnt
	  	Answer.find({where:{survey_id : ctx.instance.survey_id, status : 1}}, function(err, items){
	  		if (!err)
	  		{
		  		app.models.Survey.updateAll({id : ctx.instance.survey_id},{respondent_cnt : items.length}, function(err, info){
				});
	  		}
	  	})
	  	//update survey's user_cnt
	  	Answer.find({where:{survey_id : ctx.instance.survey_id}}, function(err, items){
	  		if (!err)
	  		{
		  		app.models.Survey.updateAll({id : ctx.instance.survey_id},{user_cnt : items.length}, function(err, info){
				});
	  		}
	  	})
	  	//update customer's no of survey
	  	Answer.find({where:{customer_id : ctx.instance.customer_id, status : 1}}, function(err, items){
	  		if (!err)
	  		{
	  			app.models.Customer.findById(ctx.instance.customer_id, function(err, item){
	  				if (!err) {
				  		item.updateAttributes({survey_cnt : items.length}, function(err, inst){
						});
	  				}
	  			});
	  		}
	  	})
	  	next();
	  });
	});

};
