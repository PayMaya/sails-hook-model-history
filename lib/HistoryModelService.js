var Waterline = require('waterline');
var orm = new Waterline();
var async = require('async');
var HistoryModelFields = require('./HistoryModelFields');
var WaterlineLifecycleCallback = require('./WaterlineLifecycleCallback');

var self = {
  createModels: function createModels(sails, callback){
    async.auto({
      loadCollection: function createAllModelHistory(asyncCb){
        if (!sails.models) {
          return asyncCb({
            message: 'No models!'
          });
        }
        _.each(sails.models, function eachInstantiatedModel(model, identity) {
          WaterlineLifecycleCallback.extendLifecycleCallbackMethod(model);

          model.associations = populateAssociations(model);
          var waterlineModel = Waterline.Collection.extend(model);

          orm.loadCollection(waterlineModel);
          if (model.history) {
            self.createHistory(model);
          }
        });
        return asyncCb(null, true);
      },
      tearDown: ['loadCollection', function tearDatabaae(asyncCb) {
        self.tearDownDatabase(self.getConnections(), asyncCb);
      }],
      loadModel: ['tearDown', loadModels]
    }, function(err, result) {
      if (err) {
        sails.log.error('Error creating history models ', err);
        callback(err);
      } else {
        sails.log.info('Successful creating of history models');
        callback(null, true);
      }
    });

    function loadModels(asyncCb) {
      orm.initialize({
        adapters: sails.adapters,
        connections: self.getConnections()
      }, function(err, models) {
        if (err) {
          sails.log.debug('Error initializing models ', err);
          return asyncCb(err);
        } else {
          self.globalizeModels(models, asyncCb);
        }
      });
    }

    function populateAssociations(model) {
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
  },

  createHistory: function(model) {
    var historyFields = {};
    var originalFields = _.clone(model.attributes);
    _.extend(historyFields, HistoryModelFields.attributes, model.attributes);
    var modifiedHistoryFields = self.changeHistoryFields(historyFields);
    var historyTableName = model.tableName ? model.tableName : model.identity;

    sails.log.info('History Table Name ' + historyTableName);
    var waterlineModelHistory = Waterline.Collection.extend({
      identity: model.identity + model.historyModelSuffix,
      globalId: model.globalId + model.historyModelSuffix,
      tableName: model.historyTablePrefix + historyTableName + model.historyTableSuffix,
      migrate: model.migrate,
      connection: model.historyConnection ? model.historyConnection : model.connection,
      attributes: modifiedHistoryFields

    });
    orm.loadCollection(waterlineModelHistory);
  },

  getConnections: function(){
    var connections = {};

    _.each(sails.adapters, function loopAllAdapters(adapter, adapterKey) {
      _.each(sails.config.connections, function loopConnections(connection, connectionKey) {
        if (adapterKey === connection.adapter) {
          connections[connectionKey] = connection;
        }
      });
    });
    return connections;
  },

  tearDownDatabase: function(connections, asyncCb){
    var connections = connections;
    var toTearDown = [];

    _.each(connections, function loopConnections(connection, connectionKey) {
      toTearDown.push({
        adapter: connection.adapter,
        connection: connectionKey
      });
    });
    async.each(toTearDown, function(tear, callback) {
      sails.adapters[tear.adapter].teardown(tear.connection, callback);
    });
    return asyncCb(null, true);
  },

  globalizeModels: function(models, asyncCb){
    _.each(models.collections, function eachInstantiatedModel(model, identity) {
      sails.log.info('Load model ', model.globalId);
      global[model.globalId] = model;
    });
    return asyncCb(null, true);
  },

  changeHistoryFields: function(attributes) {
    var historyAttributes = _.clone(attributes);
    _(historyAttributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
      attrDef.required = false;
    });
    return historyAttributes;
  }
};

module.exports = self;
