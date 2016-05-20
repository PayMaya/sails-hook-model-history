var Waterline = require('waterline');
var orm = new Waterline();
var async = require('async');
var HistoryModelFields = require('./HistoryModelFields');
var WaterlineLifecycleCallback = require('./WaterlineLifecycleCallback');

var self = {
  createModel: function (sails) {
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
      if(sails.models){
        _.each(sails.models, function eachInstantiatedModel(model, identity) {
          var fields = model.attributes;
          console.log("CALLBACKS");
          console.log(model);
          WaterlineLifecycleCallback.extendLifecycleCallbackMethod(model);
          model.associations = populateAssociations(model);
          var waterlineModel = Waterline.Collection.extend(model);

          orm.loadCollection(waterlineModel);

          if (model.history) {
            var historyFields = {}
            var originalFields = _.clone(fields);
            historyFields = _.extend(HistoryModelFields.attributes, originalFields);
            var historyTableName = model.tableName ? model.tableName : model.identity;

            sails.log.info('History Table Name ' + historyTableName);
            var waterlineModelHistory = Waterline.Collection.extend({
              identity: model.identity +  model.historyModelSuffic,
              globalId : model.identity + model.historyModelSuffic,
              tableName: model.historyTablePrefix + historyTableName + model.historyTableSuffix,
              migrate : model.migrate,
              connection: model.historyConnection ?  model.historyConnection : model.connection,
              attributes : historyFields

            });
            orm.loadCollection(waterlineModelHistory);
          }
          asyncCb(null, true);
        });
      } else {
        asyncCb({message : 'No models.'});
      }
    }

    function loadModels(asyncCb, asyncRes){
      console.log(sails.config.connections)
      var connections = {};

      _.each(sails.adapters, function(adapter, adapterKey) {
        _.each(sails.config.connections, function(connection, connectionKey) {
          if (adapterKey === connection.adapter){
            connections[connectionKey] = connection;
          }
        });
      });

      var toTearDown = [];

      _.each(connections, function(connection, connectionKey) {
        toTearDown.push({ adapter: connection.adapter, connection: connectionKey });
      });

      async.each(toTearDown, function(tear, callback) {
         sails.adapters[tear.adapter].teardown(tear.connection, callback);
      }, function(){
        orm.initialize({
           adapters: sails.adapters,
           connections: connections
         }, function(err, models) {
          if (err) {
            sails.log.debug("Error initializing models ", err);
          } else {
            _.each(models.collections, function eachInstantiatedModel(model, identity) {
              sails.log.info('Load model ', model.globalId);
              global[model.globalId] = model;
            });
          }
        });
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
