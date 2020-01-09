'use strict';

module.exports = function(server) {
	var schedule = require('node-schedule');

	//register cron jobs for daily salary
	var CronJob = require('cron').CronJob;
	var j = new CronJob('00 00 00 * * *', function() {
		console.log('salary cron job on ', new Date());
		server.models.Driver.find({}, function(err, drivers){
			if (err)
				return;
			var wallet_data = [];
			for (var i = 0; i < drivers.length; i++) {
				wallet_data.push({
						type : 1,
						description : 'Daily Wage',
						date : new Date(),
						amount : drivers[i].salary,
						driver_id : drivers[i].id
					});
			}
			server.models.Wallet.create(wallet_data, function(err, info){

			});
		})
	}, null, true, 'Asia/Beirut');
	console.log(new Date());

};
