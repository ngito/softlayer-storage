'use strict'

var storage = require('./softlayer-storage.js');
var config  = require('./config.js');
var fs = require('fs');
var localFileName = 'localfile.png';

// ------------------------------ Upload File ------------------------------    
// Upload method quite ok
// ---------------------------------------------------------------------------    
storage.uploadFile(config, 'example.png', false, function(error, response, dstFileName) {
    if (error || (response && response.statusCode != 201))
    {
        console.log("\tUnable to upload file %s - %s", dstFileName, JSON.stringify(response));
        return;
    }
        
    console.log("\tStatus = %d", response.statusCode);
    console.log("\tFile Name: %s", dstFileName);

    // ------------------------------ Download File ------------------------------    
    // HACK! downloadFile function still has flaw, it didn't know when download stream has completed
    // ---------------------------------------------------------------------------    
    var file = fs.createWriteStream(localFileName);
    storage.downloadFile(config, dstFileName, function(error, response) {
        console.info("\tDownloading %d bytes of %s to %s", response.headers['content-length'], dstFileName, localFileName);
        file.write(response.body, 'binary');
    });
    
    // ------------------------------ Delete File ------------------------------    
    // HACK! Because downloadFile function still has flaw, deleteFile can't be called immediately, instead its using timer
    // ---------------------------------------------------------------------------    
    setTimeout(function() {
        storage.deleteFile(config, dstFileName, function(error, response) {
            if (error || (response && response.statusCode != 204))
                console.log("\tUnable to delete file %s - %s", dstFileName, JSON.stringify(response));
            else
                console.log("\tFile %s has been deleted", dstFileName);
                
            process.exit(0);
        });
    }, 2000);
});

