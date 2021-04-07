var fs = require('fs');
var path = require('path');

var configuration = {};
var localConfiguration = {};
try {
    configuration = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/configuration.json'), 'UTF-8'))
} catch(e) {
}
try {
    localConfiguration = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/configuration.local.json'), 'UTF-8'))
} catch(e) {
}

function deepCopy(data, extension) {
    data = data ? JSON.parse(JSON.stringify(data)) : {};
    extension = extension ? JSON.parse(JSON.stringify(extension)) : {};
    var keys = Object.keys(extension);
    for(var i in keys) {
        var key = keys[i];
        if(!data[key]) {
            data[key] = extension[key];
            continue;
        }
        try {
            if(Object.keys(data[key]).length > 0 && Object.keys(extension[key]).length > 0) {
                data[key] = deepCopy(data[key], extension[key]);
                continue;
            }
        } catch(e) {
        }
        data[key] = extension[key];
    }
    return data;
}

module.exports = deepCopy(configuration, localConfiguration);