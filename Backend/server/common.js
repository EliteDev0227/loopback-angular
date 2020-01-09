
var socketList = [];
var socketIdList = [];

var OrderType = {
	NEW_ORDER : 1,
	EXCHANGE : 2,
	REFUND : 3
}

var OrderPackStatus = {
	NOT_PACKED : 0,
	PACKED : 1,
	REJECTED : 2,
	SENT : 3,
	CANCELLED : 4
}

var OrderStatus = {
	NOT_ASSIGNED : 0,
	ASSIGNED : 1,
	IN_PROGRESS : 2,
	DELIVERED : 3,
	FAILED_ON_DELIVERY : 4,
	CANCELLED : 5
}

var QueueStatus = {
	STOPPED : 1,
	STARTED : 2,
	RUNNING : 3,
	FINISHED : 4
}

var DriverStatus = {
	NO_QUEUE : 0,
	ASSIGNED : 1,
	ACCEPTED : 2,
	PACK_RECEIVED : 3
}

var addTime = function(start_time, seconds) {
	var h = Number(start_time.substr(0, 2));
	var m = Number(start_time.substr(3, 2));
	var s = Number(start_time.substr(6, 2));
	// h += (seconds - seconds % 3600) / 3600;
	// m += (Math.floor(seconds / 60)) % 60;
	// s += (seconds % 60);

	s += seconds;
	m += Math.floor(s / 60);
	s = s % 60;
	h += Math.floor(m / 60);
	m = m % 60;

	if (h < 10)
		h = "0" + h;
	if (m < 10)
		m = "0" + m;
	if (s < 10)
		s = "0" + s;
	return h + ":" + m + ":" + s;
}

module.exports = {
	QueueStatus : QueueStatus,
	OrderType : OrderType,
	OrderStatus : OrderStatus,
	OrderPackStatus : OrderPackStatus,
	DriverStatus : DriverStatus,
	addTime : addTime,
	socketList : socketList,
	socketIdList : socketIdList
};