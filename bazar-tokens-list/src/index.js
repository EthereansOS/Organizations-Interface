(require('dotenv')).config();
require('./utils');
var fs = require('fs');
var path = require('path');
var configuration = require('./configuration');

var context = {};
context.blockSearchSize = window.context.blockSearchLimit = 40000;
context.dfoDeployedEvent = "DFODeployed(address_indexed,address)";
context.newDfoDeployedEvent = "DFODeployed(address_indexed,address_indexed,address,address)";

configuration.blockchainConnectionString = configuration.blockchainConnectionString || process.env.BLOCKCHAIN_CONNECTION_STRING;
configuration.blockchainConnectionStringRopsten = configuration.blockchainConnectionStringRopsten || process.env.BLOCKCHAIN_CONNECTION_STRING_ROPSTEN;
configuration.blockchainConnectionForLogString = configuration.blockchainConnectionForLogString || process.env.BLOCKCHAIN_CONNECTION_FOR_LOG_STRING;
configuration.blockchainConnectionForLogStringRopsten = configuration.blockchainConnectionForLogStringRopsten || process.env.BLOCKCHAIN_CONNECTION_FOR_LOG_STRING_ROPSTEN;

function cleanPath(path) {
    try {
        fs.rmdirSync(path, { recursive: true });
    } catch (e) {
        console.error(e);
    }
    try {
        fs.mkdirSync(path, { recursive: true });
    } catch (e) {
        console.error(e);
    }
}

async function start() {
    var p = path.resolve(__dirname, '..', configuration.distFolder);
    //cleanPath(p);
    console.log('Programmable Equities and Tokens');
    var json = {
        3: await dumpList(3),
        1: await dumpList(1)
    };
    dumpLists(json, p);
    writeDecentralizedFlexibleOrganizations(p);
    console.log('Indexes');
    var inexesJson = {
        3: await dumpIndexesList(3, json[3]),
        1: await dumpIndexesList(1, json[1])
    }
    dumpLists(inexesJson, p);
}

function writeDecentralizedFlexibleOrganizations(p) {
    var programmableEquities = JSON.parse(fs.readFileSync(path.resolve(p, 'programmableEquities' + '.json'), "UTF-8"));
    programmableEquities.tokens = programmableEquities.tokens.filter(it => it.chainId === 1);
    fs.writeFileSync(path.resolve(p, 'decentralizedFlexibleOrganizations' + '.json'), JSON.stringify(programmableEquities, null, 4));
};

function dumpLists(json, p) {
    var keys = Object.keys(Object.values(json)[0]);
    for (var key of keys) {
        if (key === 'originalIndexes') {
            continue;
        }
        var list = configuration.tokensTemplates[key] || {
            name: key,
            keywords: [],
            tags: {},
            version: {
                major: 0,
                minor: 0,
                patch: 1
            },
            timestamp: new Date().toISOString(),
            tokens: []
        };
        list.tokens = list.tokens || [];
        Object.values(json).forEach(it => list.tokens.push(...it[key]));
        try {
            var oldList = JSON.parse(fs.readFileSync(path.resolve(p, key + '.json'), "UTF-8"));
            list.version = oldList.version;
            list.timestamp = oldList.timestamp;
            if (JSON.stringify(list.tokens) !== JSON.stringify(oldList.tokens)) {
                list.timestamp = new Date().toISOString();
                list.version = updateVersion(list.version);
            }
        } catch (e) {
            console.error(e);
        }
        fs.writeFileSync(path.resolve(p, key + '.json'), JSON.stringify(list, null, 4));
    }
}

function updateVersion(version) {
    var newVersion = JSON.parse(JSON.stringify(version));
    newVersion.patch++;
    if (newVersion.patch === 10) {
        newVersion.patch = 0;
        newVersion.minor++;
    }
    if (newVersion.minor === 10) {
        newVersion.minor = 0;
        newVersion.major++;
    }
    return newVersion;
}

async function connect(networkId) {
    window.web3 = await window.createWeb3(window.getNetworkElement("blockchainConnectionString", networkId));
    window.networkId = networkId;
    window.web3ForLogs = await createWeb3(window.getNetworkElement("blockchainConnectionForLogString") || window.web3.currentProvider);
    window.uniswapV2Router = window.newContract(window.context.UniswapV2RouterAbi, window.context.uniswapV2RouterAddress);
    window.wethToken = window.newContract(window.context.votingTokenAbi, window.wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.uniswapV2Router.methods.WETH)));
    window.uniswapV2Factory = window.newContract(window.context.UniswapV2FactoryAbi, window.context.uniSwapV2FactoryAddress);
    window.tokenInfosCache = {};
};

async function dumpList(networkId) {
    var start = new Date().getTime();
    await connect(networkId);
    var elements = await loadData();
    console.log(networkId, (new Date().getTime() - start) / 1000);
    return elements;
}

async function dumpIndexesList(networkId, data) {
    var start = new Date().getTime();
    await connect(networkId);

    var allTokens = data.programmableEquities.map(it => window.web3.utils.toChecksumAddress(it.address));
    allTokens.push(...data.uniswapTokens.map(it => window.web3.utils.toChecksumAddress(it.address)));

    var originalIndexes = {};
    var subArrays = window.toSubArrays(allTokens);
    for (var addresses of subArrays) {
        await window.loadUniswapPairs(addresses, originalIndexes);
    }
    var indexes = Object.values(originalIndexes);
    attachDefaultList("indexes", indexes);
    await cleanTokens(indexes, true);
    console.log(networkId, (new Date().getTime() - start) / 1000);
    return {
        indexes
    };
}

async function loadData() {
    var dfoHub = await window.loadDFO(window.getNetworkElement("dfoAddress"));
    context.dfoHubAddresses = dfoHub.options.allAddresses;
    var logoURI = null;
    try {
        var metadata = await window.AJAXRequest(window.formatLink(window.web3.eth.abi.decodeParameter("string", await window.blockchainCall(dfoHub.methods.read, 'getMetadataLink', '0x'))));
        logoURI = window.formatLink(metadata.logoUri instanceof Array ? metadata.logoUri[0] : metadata.logoUri);
    } catch (e) {}
    context.list = {
        dfoHub: {
            key: 'dfoHub',
            token: await window.loadTokenInfos(await window.blockchainCall(dfoHub.methods.getToken), undefined, true),
            fromBlock: window.getNetworkElement("deploySearchStart") + ""
        }
    };
    context.list.dfoHub.token.logoURI = logoURI;
    context.list.dfoHub.token.logo = logoURI;
    context.alreadyLoaded = {};
    var blockTranches = await window.loadBlockSearchTranches();
    for(var blocksSegment of blockTranches) {
        await getLogs(blocksSegment[0], blocksSegment[1], context.newDfoDeployedEvent);
        await getLogs(blocksSegment[0], blocksSegment[1], context.dfoDeployedEvent);
    }
    delete context.alreadyLoaded;

    var programmableEquities = Object.values(context.list).map(it => it.token);
    attachDefaultList("programmableEquities", programmableEquities);
    var uniswapTokens = await loadUniswapTokens(programmableEquities);
    attachDefaultList("uniswapTokens", uniswapTokens);

    await cleanTokens();

    return {
        programmableEquities,
        uniswapTokens
    };
};

function attachDefaultList(name, tokens) {
    var p = path.resolve(__dirname, '..', 'resources');
    try {
        var defaultList = JSON.parse(fs.readFileSync(path.resolve(p, `${name}.default.json`), 'UTF-8'));
        for (var token of defaultList) {
            if (token.chainId !== window.networkId) {
                continue;
            }
            var address = window.web3.utils.toChecksumAddress(token.address);
            tokens.push(window.tokenInfosCache[address] = window.tokenInfosCache[address] || token);
        }
    } catch (e) {}
}

async function cleanTokens(tokens, noLogo) {
    tokens = tokens || Object.values(window.tokenInfosCache);
    for (var element of tokens) {
        element.token && (element.symbol = element.symbol || await window.blockchainCall(element.token.methods.symbol));
        delete element.token;
        element.token0 && element.token1 && await cleanTokens([element.token0, element.token1], noLogo);
        element.chainId = window.networkId;
        element.logoURI = element.logoURI || element.logo;
        element.decimals && (element.decimals = parseInt(element.decimals));
        element.tags = [];
        element.address = window.web3.utils.toChecksumAddress(element.address);
        element.name = window.shortenWord(element.address === window.wethAddress ? 'Ethereum' : element.name, window.context.tokenListWordLimit).replace(/[^\w\s]/gi, '').trim();
        element.symbol = window.shortenWord(element.address === window.wethAddress ? 'ETH' : element.symbol, window.context.tokenListWordLimit).replace(/[^\w\s]/gi, '').trim();
        element.decimals = element.address === window.wethAddress ? '18' : element.decimals;
        delete element.logo;
        delete element.token0;
        delete element.token1;
        delete element.isUniswapPair;
        delete element.fromBlock;
        delete element.key;
        Object.keys(element).forEach(key => element[key] === undefined && delete element[key]);
        if (!element.logoURI && !noLogo) {
            element.logoURI = await window.loadLogo(element.address);
        }
    }
}

async function recursiveLoadPair(globalIndex, localIndex) {
    localIndex = localIndex || globalIndex;
    if (Object.keys(localIndex).length === 0) {
        return;
    }
    var indexes = {};
    for (var pair of Object.values(localIndex)) {
        await window.loadUniswapPairs(pair, indexes);
    }
    Object.entries(indexes).forEach(entry => globalIndex[entry[0]] = entry[1]);
    await recursiveLoadPair(globalIndex, indexes);
}

async function loadUniswapTokens(except) {
    except = except || [];
    var uniwapTokens = [];
    var filter = function filter(it) {
        return it.chainId === window.networkId && except.indexOf(window.web3.utils.toChecksumAddress(it.address)) === -1;
    };
    var tokens = (await window.AJAXRequest(window.context.uniwsapOfficialTokensList)).tokens.filter(filter);
    for (var token of tokens) {
        var address = window.web3.utils.toChecksumAddress(token.address);
        uniwapTokens.push(window.tokenInfosCache[address] = window.tokenInfosCache[address] || {
            key: address,
            fromBlock: window.getNetworkElement("uniswapStartBlock") + "",
            address,
            token: window.newContract(window.context.votingTokenAbi, address),
            name: token.name,
            symbol: token.symbol,
            decimals: window.numberToString(token.decimals),
            logo: token.logoURI
        });
    }
    return uniwapTokens;
};

function contains(list, address) {
    for (var element of list) {
        if (window.web3.utils.toChecksumAddress(element.address) === window.web3.utils.toChecksumAddress(address)) {
            return true;
        }
    }
    return false;
};

async function getLogs(fromBlock, toBlock, event) {
    var logs = await window.getDFOLogs({
        address: context.dfoHubAddresses,
        event,
        fromBlock: '' + fromBlock,
        toBlock: '' + toBlock
    });
    for (var log of logs) {
        if (context.alreadyLoaded[log.data[0].toLowerCase()]) {
            continue;
        }
        context.alreadyLoaded[log.data[0].toLowerCase()] = true;
        var key = log.blockNumber + '_' + log.id;
        var dFO = await window.loadDFO(log.data[0]);
        var logoURI = null;
        try {
            var metadata = await window.AJAXRequest(window.formatLink(window.web3.eth.abi.decodeParameter("string", await window.blockchainCall(dFO.methods.read, 'getMetadataLink', '0x'))));
            logoURI = window.formatLink(metadata.logoUri instanceof Array ? metadata.logoUri[0] : metadata.logoUri);
        } catch (e) {}
        context.list[key] = context.list[key] || {
            key,
            fromBlock: log.blockNumber + "",
            token: await window.loadTokenInfos(await window.blockchainCall(dFO.methods.getToken), undefined, true)
        };
        context.list[key].token.logoURI = logoURI ? logoURI : context.list[key].token.logoURI;
        context.list[key].token.logo = logoURI ? logoURI : context.list[key].token.logo;
    }
    return logs;
};

start().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(-1);
});