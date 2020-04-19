function Boot() {
    var pathName = 'index';
    var props = {};
    var callback = undefined;
    for(var i in arguments) {
        var arg = arguments[i];
        if(typeof arg === 'string') {
            pathName = arg;
        }
        if(typeof arg === 'object') {
            props = arg;
        }
        if(typeof arg === 'function') {
            callback = arg;
        }
    }
    ReactModuleLoader.load({
        modules: ['spa/' + pathName],
        scripts: ['spa/globalCatcher.jsx', 'spa/loaderMinimino.jsx'],
        callback : function() {
            React.globalCatcher = function(error) {
                return React.createElement('GlobalCatcher', {error});
            }
            React.globalLoader = function() {
                return React.createElement('LoaderMinimino');
            }
            ReactDOM.render(React.createElement(window[pathName.firstLetterToUpperCase()], props), document.body, callback);
        }
    });
}