'use strict'

var _request  = require('request')
  , _uuid     = require('uuid')
  , _token    = null
  , _authData = null

/**
 * 1. get token 
 *    X-Auth-Key: tk12345678901234567890123456789012
 *    X-Auth-User: SLOS123456-2:SL123456
 *
 * 2. _token object structure (returned after authentitcation)
 *    x-auth-token-expires: 56867
 *    x-auth-token:         AUTH_tk12345678901234567890123456789012
 *    x-storage-token:      AUTH_tk12345678901234567890123456789012
 *    x-storage-url:        https://dal05.objectstorage.softlayer.net/v1/AUTH_0d8911b1-4c8c-4651-bf92-f24bd3f8c123
 *    x-trans-id:           txb1234567890123456789012345678901
*/
  
function hasTokenExpired()
{
    // Token is not initialized, consider this has expired
    if (_token == null)
    {
        console.log("\tGet Token");
        return true;
    }

    // TODO: Token has expired!    
    if (_token['x-auth-token-expires'] < 0)
    {
        console.log("\tPrevious Token Expired!");
        return true;
    }
        
    // Else, token is still valid!
    console.log("\tUse Previous Token");
    return false;
}

function signOn(config, callback)
{
    // first get upload endpoint and access token
    console.info('>> login');
    
    // Reuse previous token
    if (!hasTokenExpired())
    {
        callback(null, _authData, _token);
        return;
    }
    
    var option = {
        url:config.authEndpoint, 
        headers:{
            "X-Auth-Key": config.apiKey,
            "X-Auth-User": config.user
        }
    };
    
    _request.get(option, function (error, response, body) {
        if (error || (response && response.statusCode != 200)) {
            callback(error, null, null);
        }
        
        //console.log("\tResponse: %s", JSON.stringify(response));
        //console.log("\tAuth Data: %s", body);
        console.log("\tOK");
        
        if (_token == null)
            _token = {};
            
        for (var header in response.headers)
        {
            if (header[0].toUpperCase() == 'X')
                _token[header] = response.headers[header];
        }
        
        _authData = JSON.parse(body);
        callback(error, _authData, _token);
    });    
}

function signOut()
{
    _authData = null;
    _token    = null;    
}

function uploadFile(config, fileName, createUniqueName, callback) 
{
    signOn(config, function(error, authData, token) {
        console.info('>>> uploadFile');
        
        var path = require('path');
        
        // Generate random file name
        var dstFileName = createUniqueName ? _uuid.v4() + path.extname(fileName) : fileName;
        
        // To find out src file size
        var fs         = require('fs');
        var stat       = fs.statSync(fileName);
        
        // Destination path on object storage
        var objectPath = authData.storage.public + '/' + config.container +'/' + dstFileName;
        
        console.info("\tUploading %d bytes of %s to %s", stat.size, fileName, objectPath);

        var option = {
            url: objectPath, 
            encoding: null, // IMPORTANT: Set file transfer to binary mode
            headers:{
                'Content-Length': stat.size, 
                "X-Auth-Token": token['x-auth-token']
            }
        };
        
        fs.createReadStream(fileName).pipe(_request.put(option, function(error, response, body) {
            callback(error, response, dstFileName);
        }));        
    });
}

function downloadFile(config, remoteFileName, callback) 
{
    signOn(config, function(error, authData, token) {
        console.info('>>> downloadFile');

        // Destination path on object storage
        var objectPath = authData.storage.public + '/' + config.container + '/' + remoteFileName;
        
        var option = {
            url: objectPath, 
            encoding: null, // IMPORTANT: Set file transfer to binary mode
            headers:{
            }
        };

        // Populate All Token Entries
        for (var entry in _token)
            option.headers[entry] = token[entry];
        
        // console.log('\tDownload Header: %s', JSON.stringify(option));
        
        _request.get(option, function(error, response, body) {
            if (error || (response && response.statusCode != 200))
            {
                callback(null, response);
                return;
            }
            callback(error, response);
        });        
    });
}

function deleteFile(config, remoteFileName, callback)
{
    signOn(config, function(error, authData, token) {
        console.info('>>> deleteFile');

        // Destination path on object storage
        var objectPath = authData.storage.public + '/' + config.container + '/' + remoteFileName;
        
        var option = {
            url: objectPath, 
            encoding: null, // IMPORTANT: Set file transfer to binary mode
            headers:{
            }
        };

        // Populate All Token Entries
        for (var entry in _token)
            option.headers[entry] = token[entry];
        
        // console.log('\tDownload Header: %s', JSON.stringify(option));
        
        _request.del(option, function(error, response, body) {
            if (error || (response && response.statusCode != 200))
            {
                callback(null, response);
                return;
            }
            callback(error, response);
        });        
    });    
}

module.exports.uploadFile   = uploadFile;
module.exports.downloadFile = downloadFile;
module.exports.deleteFile   = deleteFile;

