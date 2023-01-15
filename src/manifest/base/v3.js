/* eslint-disable camelcase */
const { version } = require('../version.json')
const permissions = require('../permissions')
const { name, short_name, description } = require('../app_info')

module.exports = {
  version,
  manifest_version: 3,
  name,
  short_name,
  description,
  permissions,
  action: {
    default_title: name,
    default_popup: 'assets/html/popup.html',
    default_icon: 'assets/images/icon_128.png'
  },
  icons: {
    16: 'assets/images/icon_16.png',
    32: 'assets/images/icon_32.png',
    48: 'assets/images/icon_48.png',
    128: 'assets/images/icon_128.png'
  },
  background: {
    service_worker: 'background.js'
  }
}
