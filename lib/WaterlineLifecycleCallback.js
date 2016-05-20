var callbacksMethodToOverride = [{methodName: 'afterCreate', actionType : 'I'},
    {methodName: 'afterUpdate', actionType : 'U'}, {methodName: 'beforeDestroy', actionType: 'U'}];


var self = {
  extendLifecycleCallbackMethod: function(modelToChange) {
    _(callbacksMethodToOverride).forEach(function methodsToExtend(method) {
      var oldMethod = modelToChange[method.methodName];
      var historyModel = modelToChange.identity + modelToChange.historyModelSuffic;
      var newFunction = function(newValue, cont) {
        var historyData = _.clone(newValue);
        historyData.actionType = method.actionType;
        global[historyModel].create(historyData).exec(function(err, model) {
          if (err) {
            sails.log.debug('Error occurred in saving history ', err)
          } else {
            sails.log.info('History record created! ', model)
          }
        });
        if (oldMethod) {
          return oldMethod.call(this, newValue, cont);
        } else {
          cont();
        }
      };
      modelToChange[method.methodName] = newFunction;
    });
  }
};

module.exports = self;
