var callbacksMethodToOverride = require('./LifecycleMethodList');


var self = {
  extendLifecycleCallbackMethod: function overrideCallback(modelToChange) {
    if (modelToChange.history) {
      _(callbacksMethodToOverride.methodList).forEach(function methodsToExtend(method) {
        var oldMethod = modelToChange[method.method];
        var historyModel = modelToChange.globalId + modelToChange.historyModelSuffix;
        var newFunction = function(newValue, cont) {
          var historyData = _.clone(newValue);
          if(method.method === 'afterDestroy'){
            self.insertHistoryDeletedRecord(historyData, method.actionType, historyModel, modelToChange.attributes);
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

  insertHistoryDeletedRecord: function(deletedRecords, actionType, historyModel, fieldAttributes){
    _.each(deletedRecords, function eachInstantiatedModel(data, identity) {

      self.insertHistoryRecord(self.transformToSailsModel(data, fieldAttributes), actionType, historyModel);
    });
  },

  transformToSailsModel: function(data, fieldAttributes){
    var transformedData = {};
    _(fieldAttributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
      var retrieveDataField = !attrDef.columnName ? attrName : attrDef.columnName;
      transformedData[attrName] = data[retrieveDataField];
    });
    return transformedData;
  }
};

module.exports = self;
