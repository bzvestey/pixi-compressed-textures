function extensionChooser(supportedExtensions) {
    supportedExtensions = supportedExtensions || [];

    var imageParser = require('./imageParser')();

    return function (resource, next) {
        var ext = resource.metadata.choice;
        if (!ext) {
            return next();
        }
        
        //first we need to make sure we have the url with params and hash
        //removed, so we can properly place the chosen extension.
        var url = resource.url;
        var postfix = "";
        var qStart = url.indexOf("?");
        var hStart = url.indexOf("#");
        if (qStart !== -1 || hStart !== -1) {
          //we have to make sure we grab whatevery is first, the question or the
          //hash, so we can pull out the full postfix to the file.
          qStart = (hStart === -1 || (qStart > -1 && qStart < hStart))? qStart : hStart;
          postfix = url.substring(qStart);
          url = url.substring(0, qStart);
        }

        //let us choose extension!
        if (!resource._defaultUrlChoice) {
            resource._defaultUrlChoice = url;
            var k = url.lastIndexOf(".");
            if (k >= 0) {
                resource._baseUrl = url.substring(0, k);
            } else {
                return next();
            }
        }
        for (var i = ext.length - 1; i >= 0; i--) {
            url = resource._baseUrl + ext[i] + postfix;
            var isSupported = false;
            for (var j = 0; j < supportedExtensions.length; j++) {
                if (ext[i] === supportedExtensions[j]) {
                    resource.url = url;
                    resource.loadType = resource._determineLoadType();
                    return imageParser(resource, next);
                }
            }
        }
        return imageParser(resource, next);
    };
}

module.exports = extensionChooser;
