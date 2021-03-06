'use strict'

var React = require('react')
var mapbox = require('mapbox.js')
var MapUtils = require('../utils/MapUtils')
var GLOBALStore = require('../stores/GLOBALStore')
var _ = require('lodash')

var config = require('../config.json')
var mapbox_config = config.mapbox

var Map = React.createClass({

  displayName: 'MapComponent',

  getInitialState() {
    return {
      map: {},
      countryLayer: null
    }
  },

  componentDidMount() {
    L.mapbox.accessToken = mapbox_config.token
    var map = L.mapbox.map('map', mapbox_config.type).setView(mapbox_config.location, mapbox_config.zoomlevel)
    this.setState({map: map})
  },

  componentWillReceiveProps(nextProps) {
    if (!_.isEmpty(nextProps.geo) && !_.isEmpty(nextProps.globals) && !_.isEmpty(nextProps.configs)) {
      this.updateChoropleth(nextProps.geo, nextProps.globals, nextProps.configs)
    }
  },

  updateChoropleth(geo, globals, configs) {
    var map = this.state.map

    var shapes = geo
    var selected_indicator = GLOBALStore.getSelectedIndicator()
    var selected_year = GLOBALStore.getSelectedYear()
    var indicators = globals.data.locations
    var meta = globals.meta

    // clean up existing layers
    if (this.state.countryLayer && this.state.countryLayer._layers !== undefined) {
      for (var layer_i in this.state.countryLayer._layers) {
        map.removeLayer(this.state.countryLayer._layers[layer_i])
      }
      this.setState({countryLayer: null})
    }

    var filteredShapes = shapes.filter(function(shape) {
      return shape.properties['ISO_NAME'].toLowerCase() in indicators
    })

    var countryLayer = L.geoJson(filteredShapes, {
      style: getStyle,
      onEachFeature: onEachFeature
    }).addTo(map)

    this.setState({countryLayer: countryLayer})

    function getStyle(feature) {
      var value, color
      var countryName = feature.properties['ISO_NAME']

      if (countryName && countryName.toLowerCase() in indicators) {
        value = indicators[countryName.toLowerCase()][selected_indicator]
      } else {
        console.log('No name', feature)
      }

      switch(configs.indicators[selected_indicator].type) {

        case 'number':
          // check whether indicator has years
          if (configs.indicators[selected_indicator].years) {
            color = MapUtils.getNumberColor(value.years[selected_year], configs, meta, selected_indicator)
          } else {
            color = MapUtils.getNumberColor(value, configs, meta, selected_indicator)
          }
          break

        case 'select':
          color = MapUtils.getSelectColor(value, configs, selected_indicator)
          break

      }

      return {
          weight: 0.0,
          opacity: 1,
          fillOpacity: 1,
          fillColor: color
      }
    }

    function onEachFeature(feature, layer) {
      var closeTooltip
      var popup = new L.Popup({ autoPan: false })

      layer.on({
        mousemove: mousemove,
        mouseout: mouseout,
        click: zoomToFeature
      })

      function mousemove(e) {
        var layer = e.target
        popup.setLatLng(e.latlng)

        var value = 'No data'
        var cname = layer.feature.properties['ISO_NAME'].toLowerCase()
        if (cname in indicators && indicators[cname][selected_indicator] !== undefined) {
          var tooltipTemplate = configs.indicators[selected_indicator].tooltip

          // gdp with years
          if (configs.indicators[selected_indicator].years) {
            value = indicators[cname][selected_indicator].years[selected_year]
          } else {
            value = indicators[cname][selected_indicator]
          }
        }

        var value = MapUtils.compileTemplate(tooltipTemplate, {currentIndicator: value})

        popup.setContent('<div class="marker-title">' + layer.feature.properties['ISO_NAME'] + '</div>' + value)

        if (!popup._map) popup.openOn(map)
        window.clearTimeout(closeTooltip)

        layer.setStyle({
          weight: 3,
          opacity: 0.3,
          fillOpacity: 0.9
        })

        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront()
        }
      }

      function mouseout(e) {
        countryLayer.resetStyle(e.target)
        closeTooltip = window.setTimeout(function() {
          map.closePopup()
        }, 100)
      }

      function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds())
      }
    }

  },

  render() {
    return (
      <div className='main'>
        <div className='card map-container'>
          <div id='map'></div>
        </div>
      </div>
    )
  }

})

module.exports = Map