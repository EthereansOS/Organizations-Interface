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
    if(name === 'react-router') {
        return {
            useParams() {
                return {}
            }
        };
    }
    var elementName = name.substring(name.lastIndexOf('/') + 1);
    return (
        elementName === 'context.json' ? { ...window.context, default : window.context } :
        elementName.endsWith('.png') ? 'assets/img/' + elementName :
        elementName.substring(0) === elementName.substring(0).toLowerCase() ? window :
        window[elementName]
    );
}
window.exports = window.exports || {};

function injectGlobalProps(p) {
    var props = {...p};
    props.dfoCore = {...window, ...props.dfoCore};
    props.dfoCore.address = window.walletAddress;
    props.dfoCore.web3 = window.web3;
    props.dfoCore.networkId = window.networkId;
    props.dfoCore.getContextElement = function getContextElement(elementName) {
        return window.getNetworkElement(elementName) || window.context[elementName];
    };
    props.dfoCore.getContract = function getContract(abi, address) {
        return new Promise(function(ok) {
            ok(window.newContract(abi, address || undefined));
        });
    };
    props.dfoCore.toDecimals = function toDecimals() {
        return window.fromDecimals.apply(window, arguments);
    }
    props.dfoCore.fromDecimals = function fromDecimals() {
        return window.toDecimals.apply(window, arguments);
    }
    props.dfoCore.toFixed = function toFixed(number) {
        return window.numberToString(number);
    }
    props.dfoCore.getBlockNumber = async function getBlockNumber() {
        return parseInt(await window.web3.eth.getBlockNumber());
    }
    props.dfoCore.tryRetrieveWellKnownTokenImage = function tryRetrieveWellKnownTokenImage(address) {
        address = window.web3.utils.toChecksumAddress(address || this.voidEthereumAddress);
        var wellKnownTokens = window.context.wellKnownTokens || {};
        var wellKnownTokensStart = JSON.parse(JSON.stringify(wellKnownTokens));
        wellKnownTokens = {};
        Object.entries(wellKnownTokensStart).forEach(it => wellKnownTokens[this.web3.utils.toChecksumAddress(it[0] || this.voidEthereumAddress)] = window.formatLink(it[1]));
        return wellKnownTokens[address];
    }
    props.dfoCore.loadFarmingSetup = async function loadFarmingSetup(contract, i) {

        try {
            return await contract.methods.setup(i).call();
        } catch(e) {
        }

        var models = {
            setup : {
                types : [
                    "uint256",
                    "bool",
                    "uint256",
                    "uint256",
                    "uint256",
                    "uint256",
                    "uint256",
                    "uint256"
                ],
                names : [
                    "infoIndex",
                    "active",
                    "startBlock",
                    "endBlock",
                    "lastUpdateBlock",
                    "objectId",
                    "rewardPerBlock",
                    "totalSupply"
                ]
            },
            info : {
                types : [
                    "bool",
                    "uint256",
                    "uint256",
                    "uint256",
                    "uint256",
                    "uint256",
                    "address",
                    "address",
                    "address",
                    "address",
                    "bool",
                    "uint256",
                    "uint256",
                    "uint256"
                ],
                names : [
                    "free",
                    "blockDuration",
                    "originalRewardPerBlock",
                    "minStakeable",
                    "maxStakeable",
                    "renewTimes",
                    "ammPlugin",
                    "liquidityPoolTokenAddress",
                    "mainTokenAddress",
                    "ethereumAddress",
                    "involvingETH",
                    "penaltyFee",
                    "setupsCount",
                    "lastSetupIndex"
                ]
            }
        };
        var data = await this.web3.eth.call({
            to : contract.options.address,
            data : contract.methods.setup(i).encodeABI()
        });
        var types = [
            `tuple(${models.setup.types.join(',')})`,
            `tuple(${models.info.types.join(',')})`
        ];
        try {
            data = abi.decode(types, data);
        } catch(e) {
        }
        var setup = {};
        for(var i in models.setup.names) {
            var name = models.setup.names[i];
            var value = data[0][i];
            value !== true && value !== false && (value = value.toString());
            setup[name] = value;
        }
        var info = {};
        for(var i in models.info.names) {
            var name = models.info.names[i];
            var value = data[1][i];
            value !== true && value !== false && (value = value.toString());
            info[name] = value;
        }
        info.startBlock = info.startBlock || "0";
        return [setup, info];
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