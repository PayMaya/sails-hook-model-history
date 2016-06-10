var callbacksMethodToOverride = require('./LifecycleMethodList');


var self = {
  extendLifecycleCallbackMethod: function overrideCallback(modelToChange) {
    if (modelToChange.history) {
      _(callbacksMethodToOverride.methodList).forEach(function methodsToExtend(method) {
        var oldMethod = modelToChange[method.method];
        var historyModel = modelToChange.identity + modelToChange.historyModelSuffix;
        var newFunction = function(newValue, cont) {
          var historyData = _.clone(newValue);
          historyData.actionType = method.actionType;
          global[historyModel].create(historyData).exec(function createHistory(err, model) {
            if (err) {
              console.log(err)
              sails.log.debug('Error occurred in saving history ', err);
            } else {
              sails.log.debug('History record created!');
            }
          });
          if (oldMethod) {
            return oldMethod.call(this, newValue, cont);
          } else {
            cont();
          }
        };
        modelToChange[method.method] = newFunction;
      });
    }
  }
};

module.exports = self;
