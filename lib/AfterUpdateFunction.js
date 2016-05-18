
var self = {
    createAfterUpdateFunction : function(model){
      var oldAfterUpdate = model.afterUpdate;
      var historyModel = model.identity + 'History';
      var afterUpdate = function(oldValue, cont){
        var historyData = _.clone(oldValue);
        historyData.actionType = 'U';
        global[historyModel].create(historyData).exec(function(err, model) {
            if (err) {
              sails.log.debug('Error occurred in saving history ', err)
            } else {
              sails.log.info('History record created! ', model)
            }
        });
        if (oldAfterUpdate) {
          return oldAfterUpdate.call(this, oldValue, cont);
        } else {
          cont();
        }
      };
      return afterUpdate;
    }
};

module.exports = self;
