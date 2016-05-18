
var self = {
  createBeforeDestroyFunction : function(model){
    var oldBeforeDestroy = model.beforeDestroy;
    var historyModel = model.identity + 'History';
    var beforeDestroy = function(deletedValue, cont){
      var historyData = _.clone(deletedValue);
      historyData.actionType = 'D';
      global[historyModel].create(historyData).exec(function(err, model) {
          if (err) {
            sails.log.debug('Error occurred in saving history ', err)
          } else {
            sails.log.info('History record created! ', model)
          }
          
      });
      if (oldBeforeDestroy) {
        return oldBeforeDestroy.call(this, deletedValue, cont);
      } else {
        cont();
      }
    };
    return beforeDestroy;
  }
};

module.exports = self;
