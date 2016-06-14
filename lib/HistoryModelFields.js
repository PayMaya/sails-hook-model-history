
module.exports = {
	attributes: {
		actionType : {
			type : 'String',
			columnName: 'action_type'
		},
		logDate: {
			type : 'Datetime',
			columnName: 'log_date',
			defaultsTo : new Date()
		}
	}
};
