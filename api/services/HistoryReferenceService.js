var Waterline = require('waterline');
var orm = new Waterline();
var modelHistoryConfig = sails.config['sails-hook-model-history'];
var async = require('async');

var self = {
  createModel: function (identity, connection, tablename) {

    async.auto({
      loadCollection: createAllModelHistory,
      loadModel : ['loadCollection', loadModels]
    }, function(err, result) {
      if (err) { 
        sails.log.debug('Error creating history models ', err)
      } else {
        sails.log.info('Successful creating of history models');
      }
    });

    function createAllModelHistory(asyncCb, asyncRes){
      _.each(sails.models, function eachInstantiatedModel(model, identity) {
        var fields = model.attributes;
        sails.log.info("Load model "+ model.identity);
        if(model.history) {
          model.afterUpdate = createAfterUpdateFunction(model);
          model.afterCreate = createAfterCreateFunction(model);
          model.beforeDestroy = createBeforeDestroyFunction(model);
        }
        model.connection = connection;
        model.associations = populateAssociations(model);
        var waterlineModel = Waterline.Collection.extend(model);
        orm.loadCollection(waterlineModel);
        if (model.history) {
          var historyFields = _.clone(fields);
          historyFields.actionType = {type : 'String', columnName: 'action_type'};
          historyFields.historyLogTime = {type : 'Datetime', columnName: 'history_logtime', defaultsTo : new Date()};
          var historyTableName = model.tableName ? model.tableName : model.identity;
          sails.log.info('History Table Name ' + model.historyTablePrefix + historyTableName + model.historyTableSuffix);
          var waterlineModelHistory = Waterline.Collection.extend({
            identity: model.identity + 'History',
            globalId : model.identity + 'History',
            tableName: model.historyTablePrefix + historyTableName + model.historyTableSuffix,
            migrate : model.migrate,
            connection: connection,
            attributes : historyFields

          });
          orm.loadCollection(waterlineModelHistory);
        }
      });
      asyncCb(null, true);
    }

    function createAfterUpdateFunction(model){
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

    function createAfterCreateFunction(model){
      var oldAfterCreate = model.afterCreate;
      var historyModel = model.identity + 'History';
      var afterCreate = function(newValue, cont){
        var historyData = _.clone(newValue);
        historyData.actionType = 'I';
        console.log('model.identity ' + model.identity);
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

    function createBeforeDestroyFunction(model){
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

    function loadModels(asyncCb, asyncRes){
      orm.initialize(sails.config.sampleDB, function(err, models) {
        if (err) {
          sails.log.debug("Error initializing models ", err);
        } else {
          _.each(models.collections, function eachInstantiatedModel(model, identity) {
            global[model.globalId] = model;
          });
        }
      });
      
      asyncCb(null, true);
    }

    function populateAssociations(model){
         var associatedWith = [];
        _(model.attributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
          if (typeof attrDef === 'object' && (attrDef.model || attrDef.collection)) {
            var assoc = {
              alias: attrName,
              type: attrDef.model ? 'model' : 'collection'
            };
            if (attrDef.model) {
              assoc.model = attrDef.model;
            }
            if (attrDef.collection) {
              assoc.collection = attrDef.collection;
            }
            if (attrDef.via) {
              assoc.via = attrDef.via;
            }

            associatedWith.push(assoc);
          }
        });
        sails.log.debug('Model Associations ', associatedWith);
        return associatedWith;
    }
  }
};

module.exports = self;
