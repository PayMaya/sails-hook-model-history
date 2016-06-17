var callbacksMethodToOverride = require('./LifecycleMethodList');


var self = {
  extendLifecycleCallbackMethod: function overrideCallback(modelToChange) {
    if (modelToChange.history) {
      self.findPrimaryKeyColumn(modelToChange);
      _(callbacksMethodToOverride.methodList).forEach(function methodsToExtend(method) {
        var oldMethod = modelToChange[method.method];
        var historyModel = modelToChange.globalId + modelToChange.historyModelSuffix;
        var newFunction = function(newValue, cont) {
          var historyData = _.clone(newValue);
          if(method.method === 'afterDestroy'){
            var primaryColumns = self.findPrimaryKeyColumn(modelToChange);
            self.insertHistoryDeletedRecord(historyData, method.actionType, historyModel, primaryColumns);
          }else{
            self.insertHistoryRecord(historyData, method.actionType, historyModel);
          }
          if (oldMethod) {
            return oldMethod.call(this, newValue, cont);
          } else {
            cont();
          }
        };
        modelToChange[method.method] = newFunction;
      });
    }
  },

  findPrimaryKeyColumn: function(model){
    var primaryKeyAtt = [];
    _(model.attributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
      if(attrDef.primaryKey) {
        primaryKeyAtt.push(attrName);
      }
    });
    return primaryKeyAtt;
  },

  insertHistoryRecord: function(data, actionType, historyModel){
    data.actionType = actionType;
    global[historyModel].create(data).exec(function createHistory(err, model) {
      if (err) {
        sails.log.debug('Error occurred in saving history ', err);
      } else {
        sails.log.debug('History record created!');
      }
    });
  },

  insertHistoryDeletedRecord: function(deletedRecords, actionType, historyModel, key){
    _.each(deletedRecords, function eachInstantiatedModel(data, identity) {
      self.insertHistoryRecord(_.pick(data, key), actionType, historyModel);
    });
  }
};

module.exports = self;
