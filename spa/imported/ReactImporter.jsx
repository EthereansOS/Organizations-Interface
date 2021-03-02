function require(name) {
    if(name === 'react') {
        return React;
    }
    if(name === 'prop-types') {
        return PropTypes;
    }
    if(name === 'react-redux') {
        return {
            connect() {
                return function connect(element) {
                    window[element.name] = function(props) {
                        return element(injectGlobalProps(props));
                    }
                }
            }
        }
    }
    var elementName = name.substring(name.lastIndexOf('/') + 1);
    return (
        elementName === 'context.json' ? { ...window.context, default : window.context } :
        elementName.endsWith('.png') ? 'assets/img/' + elementName :
        elementName.substring(0) === elementName.substring(0).toLowerCase() ? window :
        window[elementName]
    );
}
window.exports = {};

function injectGlobalProps(p) {
    var props = {...p};
    props.dfoCore = {...window, ...props.dfoCore};
    props.dfoCore.address = window.walletAddress;
    props.dfoCore.web3 = window.web3;
    props.dfoCore.networkId = window.networkId;
    props.dfoCore.getContextElement = function getContextElement(elementName) {
        var element = window.getNetworkElement(elementName);
        return element || window.context[elementName];
    };
    props.dfoCore.getContract = function getContract(abi, address) {
        return new Promise(function(ok) {
            address && ok(window.newContract(abi, address));
            !address && ok(window.newContract(abi));
        });
    };
    props.dfoCore.toDecimals = function toDecimals() {
        return window.fromDecimals.apply(window, arguments);
    }
    props.dfoCore.fromDecimals = function fromDecimals() {
        return window.toDecimals.apply(window, arguments);
    }
    return props;
};

function ImportReact(args) {
    var displayName = args.name || args.displayName;
    var elementToRender = args.render;
    return window[displayName] = window[displayName] || React.createClass({
        ...args,
        displayName : displayName,
        render() {
            var props = {};
            this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
            this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
            props.props && Object.entries(props.props).forEach(entry => props[entry[0]] = entry[1]);
            delete props.props;
            props.parentReactElement = this;
            props.element = this.props.element;
            return <div className={args.className}>{React.createElement(window[elementToRender], injectGlobalProps(props))}</div>
        }
    });
}