'use strict'

var Dispatcher = require('flux').Dispatcher
var objectAssign = require('object-assign')
var PayloadSources = require('../constants/PayloadSources')

var AppDispatcher = objectAssign(new Dispatcher(), {
  handleServerAction: function(action) {
    if (!action.type) {
      throw new Error('Empty action.type: you likely mistyped the action.')
    }

    this.dispatch({
      source: PayloadSources.SERVER_ACTION,
      action: action
    })
  },

  handleViewAction: function(action) {
    if (!action.type) {
      throw new Error('Empty action.type: you likely mistyped the action.')
    }

    this.dispatch({
      source: PayloadSources.VIEW_ACTION,
      action: action
    })
  }

})

module.exports = AppDispatcher