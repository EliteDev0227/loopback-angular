'use strict';

module.exports = function(Item) {

  var app = require('../../server/server');

	Item.observe('before delete', function(ctx, next) {
		Item.find({where:ctx.where}, function(err, item){
		  if (item && item.length > 0 && item[0].type == 2) {
		  	Item.updateAll({id : item[0].org_id}, {refund : 0}, function(err, info){
		  		next();
		  	});
		  }
		  else
			  next();	
		})
	});

};
