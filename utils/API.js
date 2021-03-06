'use strict'

var axios = require('axios')
var topojson = require('topojson')
var MapServerActionCreators = require('../actions/MapServerActionCreators')

var _config = require('../config.json')
var geoPath = _config.geoPath
var configPath = _config.configPath
var globalPath = _config.globalPath

var API = {
  config() {
    axios.get(configPath).
      then(function(res) {
        MapServerActionCreators.handleCONFIGSuccess(res.data)
        return true
      })
      .catch(function(err) {
        MapServerActionCreators.handleCONFIGError(err)
      })
  },

  global() {
    axios.get(globalPath).
      then(function(res) {
        MapServerActionCreators.handleINDICATORSuccess(res.data)
        return true
      })
      .catch(function(err) {
        MapServerActionCreators.handleINDICATORError(err)
      })
  },

  geo() {
    axios.get(geoPath).
      then(function(res) {
        MapServerActionCreators.handleGEOSuccess(topojson.feature(res.data, res.data.objects['Aqueduct_country']).features)
        return true
      })
      .catch(function(err) {
        MapServerActionCreators.handleGEOError(err)
      })
  }
}

module.exports = API