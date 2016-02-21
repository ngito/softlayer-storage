'use strict'

var _authEndpoint = ""
  , _apiKey       = ""
  , _user         = ""
  , _container    = "";

if (process.env.SOFTLAYER_STORAGE) {
    var slInfo = JSON.parse(process.env.SOFTLAYER_STORAGE);

    _authEndpoint = slInfo.authEndpoint;
    _apiKey       = slInfo.apiKey;
    _user         = slInfo.user;
    _container    = slInfo.container;
}

module.exports = {
  authEndpoint : _authEndpoint,
  apiKey       : _apiKey,
  user         : _user,
  container    : _container,
};
