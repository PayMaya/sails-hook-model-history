
module.exports = {
	attributes: {
		actionType : {
			type : 'String', 
			columnName: 'action_type'
		},
		historyLogTime: {
			type : 'Datetime', 
			columnName: 'history_logtime', 
			defaultsTo : new Date()
		}
	}
};
