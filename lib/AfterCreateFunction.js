
var self = {
  createAfterCreateFunction : function(model){
    var oldAfterCreate = model.afterCreate;
    var historyModel = model.identity + 'History';
    var afterCreate = function(newValue, cont){
      var historyData = _.clone(newValue);
      historyData.actionType = 'I';
      global[historyModel].create(historyData).exec(function(err, model) {
          if (err) {
            sails.log.debug('Error occurred in saving history ', err)
          } else {
            sails.log.info('History record created! ', model)
          }
      });
      if (oldAfterCreate) {
        return oldAfterCreate.call(this, newValue, cont);
      } else {
        cont();
      }
    };
    return afterCreate;
  }
};

module.exports = self;
