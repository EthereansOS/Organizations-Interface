window.voidEthereumAddress = '0x0000000000000000000000000000000000000000';
window.voidEthereumAddressExtended = '0x0000000000000000000000000000000000000000000000000000000000000000';
window.descriptionWordLimit = 300;
window.urlRegex = /(https?:\/\/[^\s]+)/gs;
window.solidityImportRule = /import( )*"(\d+)"( )*;/gs;
window.pragmaSolidityRule = /pragma( )*solidity( )*(\^|>)\d+.\d+.\d+;/gs;
window.base64Regex = /data:([\S]+)\/([\S]+);base64,/gs;

window.Main = async function Main() {
    await window.loadContext();
    if (!await window.blockchainSetup()) {
        return;
    }
    window.choosePage();
};

window.newContract = function newContract(abi, address) {
    window.contracts = window.contracts || {};
    var key = window.web3.utils.sha3(JSON.stringify(abi));
    var contracts = (window.contracts[key] = window.contracts[key] || {});
    address = address || window.voidEthereumAddress;
    key = address.toLowerCase();
    contracts[key] = contracts[key] || new window.web3.eth.Contract(abi, address === window.voidEthereumAddress ? undefined : address);
    return contracts[key];
};

window.blockchainSetup = async function blockchainSetup() {
    if (typeof window.ethereum === 'undefined') {
        return;
    }
    try {
        window.ethereum && window.ethereum.autoRefreshOnNetworkChange && (window.ethereum.autoRefreshOnNetworkChange = false);
        window.ethereum && window.ethereum.on && window.ethereum.on('networkChanged', window.onEthereumUpdate);
        window.ethereum && window.ethereum.on && window.ethereum.on('accountsChanged', window.onEthereumUpdate);
        return window.onEthereumUpdate(0);
    } catch (e) {
        throw 'An error occurred while trying to setup the Blockchain Connection: ' + (e.message || e + '.');
    }
};

window.loadDFO = async function loadDFO(address, allAddresses) {
    allAddresses = allAddresses || [];
    allAddresses.push(address);
    var dfo = window.newContract(window.context.proxyAbi, address);
    var votingToken = window.voidEthereumAddress;

    try {
        votingToken = (await window.blockchainCall(dfo.methods.getDelegates))[0];
    } catch(e) {
    }

    if(votingToken === window.voidEthereumAddress) {
        try {
            votingToken = await window.blockchainCall(dfo.methods.getToken);
        } catch (e) {
        }
    }

    if(votingToken === window.voidEthereumAddress) {
        var logs = await window.getLogs({
            address,
            topics: [
                window.proxyChangedTopic = window.proxyChangedTopic || window.web3.utils.sha3('ProxyChanged(address)')
            ]
        }, true);
        return await window.loadDFO(window.web3.eth.abi.decodeParameter('address', logs[0].topics[1]), allAddresses);
    }
    dfo.options.originalAddress = allAddresses[0];
    dfo.options.allAddresses = allAddresses;
    return dfo;
};

window.getLogs = async function(a, endOnFirstResult) {
    var args = JSON.parse(JSON.stringify(a));
    var logs = [];
    args.fromBlock = args.fromBlock || (window.getNetworkElement('deploySearchStart') + '');
    args.toBlock = args.toBlock || (await window.web3.eth.getBlockNumber() + '');
    var to = parseInt(args.toBlock);
    while(parseInt(args.fromBlock) <= to) {
        var newTo = parseInt(args.fromBlock) + window.context.blockSearchSection;
        newTo = newTo <= to ? newTo : to;
        args.toBlock = newTo + '';
        logs.push(...(await window.web3.eth.getPastLogs(args)));
        if(logs.length > 0 && endOnFirstResult === true) {
            return logs;
        }
        args.fromBlock = (parseInt(args.toBlock) + 1) + '';
    }
    return logs;
};

window.onEthereumUpdate = function onEthereumUpdate(millis) {
    return new Promise(function(ok) {
        setTimeout(async function() {
            var update = false;
            if (!window.networkId || window.networkId !== await window.web3.eth.net.getId()) {
                delete window.contracts;
                window.web3 = new window.Web3Browser(window.web3.currentProvider);
                window.web3.currentProvider.setMaxListeners && window.web3.currentProvider.setMaxListeners(0);
                window.web3.eth.transactionBlockTimeout = 999999999;
                window.web3.eth.transactionPollingTimeout = new Date().getTime();
                window.networkId = await window.web3.eth.net.getId();
                var network = window.context.ethereumNetwork[window.networkId];
                if (network === undefined || network === null) {
                    return alert('This network is actually not supported!');
                }
                window.dfoHub = {
                    key: 'DFO',
                    dFO: await window.loadDFO(window.getNetworkElement('dfoAddress')),
                    startBlock: window.getNetworkElement('deploySearchStart')
                };
                window.ENSController = window.newContract(window.context.ENSAbi, window.context.ensAddress);
                try {
                    window.dfoHubENSResolver = window.newContract(window.context.resolverAbi, await window.blockchainCall(window.ENSController.methods.resolver, nameHash.hash(nameHash.normalize("dfohub.eth"))));
                } catch (e) {}

                window.list = {
                    DFO: window.dfoHub
                };
                update = true;
            }
            try {
                window.walletAddress = (await window.web3.eth.getAccounts())[0];
                window.walletAvatar = window.makeBlockie(window.walletAddress);
            } catch (e) {}
            update && $.publish('ethereum/update');
            $.publish('ethereum/ping');
            return ok(window.web3);
        }, !isNaN(millis) ? millis : 550);
    });
};

window.getNetworkElement = function getNetworkElement(element) {
    var network = window.context.ethereumNetwork[window.networkId];
    if (network === undefined || network === null) {
        return;
    }
    return window.context[element + network];
};

window.isEthereumAddress = function isEthereumAddress(ad) {
    if (ad === undefined || ad === null) {
        return false;
    }
    var address = ad.split(' ').join('');
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return true;
    } else {
        address = address.replace('0x', '');
        var addressHash = window.web3.utils.sha3(address.toLowerCase());
        for (var i = 0; i < 40; i++) {
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                //return false;
            }
        }
    }
    return true;
};

window.hasEthereumAddress = function(address) {
    return window.isEthereumAddress(address) && address !== window.voidEthereumAddress;
}

window.loadContext = async function loadContext() {
    var x = await fetch('data/context.json');
    window.context = await x.text();
    window.context = JSON.parse(window.context);
};

window.choosePage = function choosePage() {
    var page = undefined;
    try {
        page = window.location.pathname.split('/').join('');
        page = page.indexOf('.html') === -1 ? undefined : page.split('.html').join('');
    } catch (e) {}
    page = (page || 'index') + 'Main';

    try {
        var maybePromise = window[page] && window[page]();
        maybePromise && maybePromise.catch && maybePromise.catch(console.error);
    } catch (e) {
        console.error(e);
    }
};

window.getData = function getData(root, checkValidation) {
    if (!root) {
        return;
    }
    var data = {};
    var children = root.children().find('input,select,textarea');
    children.length === 0 && (children = root.children('input,select,textarea'));
    children.each(function(i, input) {
        var id = input.id || i;
        input.type && input.type !== 'checkbox' && (data[id] = input.value.split(' ').join(''));
        input.type === 'number' && (data[id] = parseFloat(data[id]));
        input.type === 'number' && isNaN(data[id]) && (data[id] = parseFloat(input.dataset.defaultValue));
        input.type === 'checkbox' && (data[id] = input.checked);
        !input.type || input.type === 'hidden' && (data[id] = $(input).val());
        if (checkValidation) {
            if (!data[id]) {
                throw "Data is mandatory";
            }
            if (input.type === 'number' && isNaN(data[id])) {
                throw "Number is mandatory";
            }
        }
    });
    return data;
};

window.setData = function setData(root, data) {
    if (!root || !data) {
        return;
    }
    var children = root.children().find('input,select,textarea');
    children.length === 0 && (children = root.children('input,select,textarea'));
    children.each(function(i, input) {
        var id = input.id || i;
        input.type && input.type !== 'checkbox' && $(input).val(data[id]);
        input.type && input.type === 'checkbox' && (input.checked = data[id] === true);
    });
};

window.getAddress = async function getAddress() {
    await window.ethereum.enable();
    return (window.walletAddress = (await window.web3.eth.getAccounts())[0]);
};

window.getSendingOptions = function getSendingOptions(transaction) {
    return new Promise(async function(ok, ko) {
        if (transaction) {
            var address = await window.getAddress();
            return transaction.estimateGas({
                    from: address,
                    gasPrice: window.web3.utils.toWei("13", "gwei")
                },
                function(error, gas) {
                    if (error) {
                        return ko(error.message || error);
                    }
                    return ok({
                        from: address,
                        gas: gas || window.gasLimit || '7900000'
                    });
                });
        }
        return ok({
            from: window.walletAddress || null,
            gas: window.gasLimit || '7900000'
        });
    });
};

window.createContract = async function createContract(abi, data) {
    var args = [];
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }
    var from = await window.getAddress();
    data = window.newContract(abi).deploy({
        data,
        arguments: args,
    });
    var contractAddress = window.getNextContractAddress && window.getNextContractAddress(from, await window.web3.eth.getTransactionCount(from));
    try {
        contractAddress = (await window.sendBlockchainTransaction(window.web3.eth.sendTransaction({
            from,
            data: data.encodeABI(),
            gasLimit: await data.estimateGas({ from })
        }))).contractAddress;
    } catch (e) {
        try {
            if (!contractAddress || (e.message || e).indexOf("The contract code couldn't be stored, please check your gas") === -1) {
                throw e;
            }
        } catch (a) {
            throw e;
        }
    }
    return window.newContract(abi, contractAddress);
};

window.blockchainCall = async function blockchainCall(call) {
    var args = [];
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }
    var method = (call.implementation ? call.get : call.new ? call.new : call).apply(call, args);
    return await (method._method.stateMutability === 'view' || method._method.stateMutability === 'pure' ? method.call(await window.getSendingOptions()) : window.sendBlockchainTransaction(method));
};

window.sendBlockchainTransaction = function sendBlockchainTransaction(transaction) {
    return new Promise(async function(ok, ko) {
        var handleTransactionError = function handleTransactionError(e) {
            e !== undefined && e !== null && (e.message || e).indexOf('not mined within') === -1 && ko(e);
        }
        try {
            (transaction = transaction.send ? transaction.send(await window.getSendingOptions(transaction), handleTransactionError) : transaction).on('transactionHash', transactionHash => {
                var timeout = async function() {
                    var receipt = await window.web3.eth.getTransactionReceipt(transactionHash);
                    if (!receipt || !receipt.blockNumber || parseInt(await window.web3.eth.getBlockNumber()) < (parseInt(receipt.blockNumber) + (window.context.transactionConfirmations || 0))) {
                        return window.setTimeout(timeout, window.context.transactionConfirmationsTimeoutMillis);
                    }
                    return transaction.then(ok);
                };
                window.setTimeout(timeout);
            }).catch(handleTransactionError);
        } catch (e) {
            return handleTransactionError(e);
        }
    });
};

window.loadFunctionalities = function loadFunctionalities(element, callback, ifNecessary) {
    if (!element) {
        return new Promise(ok => ok());
    }
    if (ifNecessary && element.functionalities && Object.keys(element.functionalities).length && element.functionalitiesAmount) {
        return new Promise(ok => ok(element.functionalities));
    }
    if (element.waiters) {
        return new Promise(function(ok) {
            if (!element.waiters || element.waiters.length === 0) {
                delete element.waiters;
                return ok(element.functionalities);
            }
            element.waiters.push([ok, callback]);
        });
    }
    element.waiters = [];
    return new Promise(async function(ok) {
        try {
            element.functionalityNames = JSON.parse(await blockchainCall(element.functionalitiesManager.methods.functionalityNames));
            callback && callback();
        } catch(e) {
            element.functionalityNames = [];
        }
        var functionalitiesJSON = await blockchainCall(element.functionalitiesManager.methods.functionalitiesToJSON);
        var functionalities = window.parseFunctionalities(functionalitiesJSON);
        var keys = Object.keys(functionalities);
        element.functionalities && Object.keys(element.functionalities).map(key => {
            if (!functionalities[key]) {
                delete element.functionalities[key];
            }
        });
        element.functionalities && callback && callback();
        element.functionalities = element.functionalities || {};
        for (var i in keys) {
            var key = keys[i];
            element.functionalityNames.push(key);
            callback && callback();
            var functionality = functionalities[key];
            if (element && functionality.codeName === 'getMinimumBlockNumberForSurvey') {
                element.getMinimumBlockNumberForSurvey = functionality;
            }
            if (element && functionality.codeName === 'checkSurveyResult') {
                element.checkSurveyResult = functionality;
            }
            functionality.inputParameters = [];
            try {
                functionality.inputParameters = functionality.methodSignature.split(functionality.methodSignature.substring(0, functionality.methodSignature.indexOf('(') + 1)).join('').split(')').join('');
                functionality.inputParameters = functionality.inputParameters ? functionality.inputParameters.split(',') : [];
            } catch (e) {}
            callback && callback();
            try {
                functionality.code = functionality.code || await window.loadContent(functionality.sourceLocationId, functionality.sourceLocation);
            } catch (e) {}
            functionality.description = window.extractHTMLDescription(functionality.code);
            functionality.compareErrors = await window.searchForCodeErrors(functionality.location, functionality.code, functionality.codeName, functionality.methodSignature, functionality.replaces);
            element.functionalities && (element.functionalities[key] = functionality);
            callback && callback();
            for (var i in element.waiters) {
                var c = element.waiters[i][1];
                c && setTimeout(c);
            }
            if (!element.functionalities) {
                break;
            }
        }
        if (element.waiters) {
            for (var i in element.waiters) {
                var end = element.waiters[i][0];
                setTimeout(() => end(element.functionalities));
            }
            delete element.waiters;
        }
        return ok(element.functionalities);
    });
};

window.parseFunctionalities = function parseFunctionalities(functionalitiesJSON) {
    try {
        functionalitiesJSON = functionalitiesJSON.trim();
        var functs = JSON.parse(!functionalitiesJSON.endsWith(',') ? functionalitiesJSON : functionalitiesJSON.substring(0, functionalitiesJSON.length - 1) + ']');
        var functionalities = {};
        functs.map(it => functionalities[it.codeName] = it);
        return functionalities;
    } catch (e) {
        console.error(e);
        console.log(functionalitiesJSON);
    }
    return null;
};

window.indexMain = function indexMain() {
    window.Boot();
};

window.fromDecimals = function fromDecimals(n, d) {
    n = (n && n.value || n);
    d = (d && d.value || d);
    if(!n || !d) {
        return "0";
    }
    var decimals = (typeof d).toLowerCase() === 'string' ? parseInt(d) : d;
    var symbol = window.toEthereumSymbol(decimals);
    if(symbol) {
        return window.web3.utils.fromWei((typeof n).toLowerCase() === 'string' ? n : window.numberToString(n), symbol);
    }
    var number = (typeof n).toLowerCase() === 'string' ? parseInt(n) : n;
    if (!number || this.isNaN(number)) {
        return '0';
    }
    var nts = parseFloat(window.numberToString((number / (decimals < 2 ? 1 : Math.pow(10, decimals)))));
    return window.numberToString(Math.round(nts * 100) / 100);
};

window.toDecimals = function toDecimals(n, d) {
    n = (n && n.value || n);
    d = (d && d.value || d);
    if(!n || !d) {
        return "0";
    }
    var decimals = (typeof d).toLowerCase() === 'string' ? parseInt(d) : d;
    var symbol = window.toEthereumSymbol(decimals);
    if(symbol) {
        return window.web3.utils.toWei((typeof n).toLowerCase() === 'string' ? n : window.numberToString(n), symbol);
    }
    var number = (typeof n).toLowerCase() === 'string' ? parseInt(n) : n;
    if (!number || this.isNaN(number)) {
        return 0;
    }
    return window.numberToString(number * (decimals < 2 ? 1 : Math.pow(10, decimals)));
};

window.loadContent = async function loadContent(tokenId, ocelotAddress, raw) {
    var metadata = await window.loadContentMetadata(tokenId, ocelotAddress);
    var chains = [];
    var ocelot = window.newContract(window.context.OcelotAbi, (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    for (var i = 0; i < metadata[0]; i++) {
        var content = await window.blockchainCall(ocelot.methods.content, tokenId, i);
        chains.push(i === 0 ? content : content.substring(2));
    }
    var value = chains.join('');
    value = window.web3.utils.toUtf8(value).trim();
    value = raw ? value : Base64.decode(value.substring(value.indexOf(',')));
    var regex = new RegExp(window.base64Regex).exec(value);
    !raw && regex && regex.index === 0 && (value = Base64.decode(value.substring(value.indexOf(','))));
    return value;
};

window.loadContentMetadata = async function loadContentMetadata(tokenId, ocelotAddress) {
    var ocelot = window.newContract(window.context.OcelotAbi, (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    var metadata = await window.blockchainCall(ocelot.methods.metadata, tokenId);
    metadata[0] = parseInt(metadata[0]);
    metadata[1] = parseInt(metadata[1]) * 2 + 4;
    return metadata;
};

window.getCompleteCode = async function getCompleteCode(code, alreadyLoaded) {
    alreadyLoaded = alreadyLoaded || [];
    var matches = code.match(new RegExp(window.solidityImportRule));
    if (!matches || matches.length === 0) {
        return code;
    }
    var tokens = matches.map(it => parseInt(it.split('"')[1]));
    for (var i in tokens) {
        var token = tokens[i];
        if (alreadyLoaded.filter(it => it === token).length > 0) {
            continue;
        }
        alreadyLoaded.push(token);
        var cached = window.getCodeCache()[token];
        cached = cached || {
            code: await window.loadContent(token)
        };
        cached.lastUsed = new Date().getTime();
        window.codeCache[token] = cached;
        code = code.split(matches[i]).join(cached.code.replace(new RegExpr(window.pragmaSolidityRule), ""));
    }
    return await window.getCompleteCode(code);
};

window.getCodeCache = function getCodeCache() {
    window.codeCache = window.codeCache || {};
    Object.keys(window.codeCache).map(key => {
        var cached = window.codeCache[key];
        if (new Date().getTime() > (cached.lastUsed + (60000 * 5))) {
            delete window.cache[key];
        }
    });
    return window.codeCache;
};

window.split = function split(content, length) {
    var regex = new RegExp(window.base64Regex).exec(content);
    content = regex && regex.index === 0 ? content : ('data:text/plain;base64,' + Base64.encode(content));
    var data = window.web3.utils.fromUtf8(content);
    var inputs = [];
    var defaultLength = (length || window.context.singleTokenLength) - 2;
    if (data.length <= defaultLength) {
        inputs.push(data);
    } else {
        while (data.length > 0) {
            var length = data.length < defaultLength ? data.length : defaultLength;
            var piece = data.substring(0, length);
            data = data.substring(length);
            if (inputs.length > 0) {
                piece = '0x' + piece;
            }
            inputs.push(piece);
        }
    }
    return inputs;
};

window.mint = async function mint(inputs, ocelotAddress, silent, firstChunkCallback, tokenId, start) {
    var ocelot = window.newContract(window.context.OcelotAbi, ocelotAddress || (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    inputs = (typeof inputs).toLowerCase() === 'string' ? window.split(inputs) : inputs;
    for (var i = start || 0; i < inputs.length; i++) {
        var input = inputs[i];
        !silent && $.publish('message', "Minting " + (i + 1) + " of " + inputs.length + " tokens", "info");
        var method = ocelot.methods['mint' + (i === inputs.length - 1 ? 'AndFinalize' : '') + (i === 0 ? '' : ('(uint256,bytes)'))];
        var args = [
            method
        ];
        i > 0 && args.push(tokenId)
        args.push(input);
        var txReceipt = await window.blockchainCall.apply(window, args);
        if (!tokenId) {
            tokenId = parseInt(txReceipt.events.Minted.returnValues.tokenId);
            firstChunkCallback && firstChunkCallback(tokenId);
        }
    }
    return tokenId;
};

window.numberToString = function numberToString(num, locale) {
    if (num === undefined || num === null) {
        num = 0;
    }
    if((typeof num).toLowerCase() === 'string') {
        return num;
    }
    let numStr = String(num);

    if (Math.abs(num) < 1.0) {
        let e = parseInt(num.toString().split('e-')[1]);
        if (e) {
            let negative = num < 0;
            if (negative) num *= -1
            num *= Math.pow(10, e - 1);
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
            if (negative) numStr = "-" + numStr;
        }
    } else {
        let e = parseInt(num.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            num /= Math.pow(10, e);
            numStr = num.toString() + (new Array(e + 1)).join('0');
        }
    }
    if (locale === true) {
        var numStringSplitted = numStr.split(' ').join('').split('.');
        return parseInt(numStringSplitted[0]).toLocaleString() + (numStringSplitted.length === 1 ? '' : (Utils.decimalsSeparator + numStringSplitted[1]))
    }
    return numStr;
};

window.onload = function() {
    Main().catch(function(e) {
        return alert(e.message || e);
    });
};

window.extractComment = function extractComment(code, element) {
    if (code === undefined || code === null) {
        return '';
    }
    code = code.split('\r').join('').trim();
    if (!element) {
        var comments = {};
        ['Description', 'Discussion', 'Update'].map(key => comments[key] = window.extractComment(code, key));
        return comments;
    }
    var initialCode = '/* ' + element + ':\n';
    var finalCode = '\n */\n';
    var start = code.indexOf(initialCode);
    if (start === -1) {
        return '';
    }
    start += initialCode.length;
    var end = code.indexOf(finalCode, start);
    end = end === -1 ? code.indexOf(finalCode.substring(0, finalCode.length - 1), start) : end;
    var data = code.substring(start, end);
    var split = data.split('\n');
    for (var i = 0; i < split.length; i++) {
        var tag = split[i];
        if (tag.indexOf(' * ') === 0) {
            try {
                split[i] = tag.substring(3).trim();
            } catch (e) {
                split[i] = tag.substring(2).trim();
            }
        }
    }
    return split.join('\n').trim();
};

window.putComment = function putComment(code, element, data) {
    if (code === undefined || code === null) {
        return;
    }
    code = code.split('\r').join('').trim();
    if (!element) {
        var data = window.extractComment(code);
        Object.keys(data).map(key => code = window.putComment(window.putComment(code, key, ''), key, data[key]).trim());
        return code;
    }
    data = (data || '').trim();
    var initialCode = '/* ' + element + ':\n';
    var finalCode = '\n */\n';
    var head = '';
    var tail = code;
    var start = code.indexOf(initialCode);
    if (start !== -1) {
        head = code.substring(0, start);
        var end = code.indexOf(finalCode, start);
        end = end === -1 ? code.indexOf(finalCode.substring(0, finalCode.length - 1), start) : end;
        end += finalCode.length;
        tail = code.substring(end);
    }
    if (data) {
        var split = data.split('\n');
        for (var i = 0; i < split.length; i++) {
            split[i] = " * " + split[i].trim();
        }
        data = split.join('\n');
        data = initialCode + data + finalCode;
    }
    return (head + data + tail).trim();
};

window.methodSignatureMatch = function methodSignatureMatch(methodSignature, compare) {
    for (var i in compare.abi) {
        var abi = compare.abi[i];
        if (abi.type === 'function' && abi.name + '(' + abi.inputs.map(it => it.type).join(',') + ')' === methodSignature) {
            return true;
        }
    }
    return false;
};

window.extractHTMLDescription = function extractHTMLDescription(code, updateFirst) {
    var description = '';
    var comments = window.extractComment(code);
    if (updateFirst) {
        comments.Update && (description += comments.Update);
        comments.Description && (description += ((comments.Update ? '<br/><br/><b>Description</b>:<br/>' : '') + comments.Description));
    } else {
        comments.Description && (description += comments.Description);
        comments.Update && (description += ((comments.Description ? '<br/><br/><b>Last Updates</b>:<br/>' : '') + comments.Update));
    }
    if (comments.Discussion) {
        description += '<a class="ComEXTLink" href="' + comments.Discussion + '" target="_blank"><b>Discussion Link</b></a><br/><br/>';
    }
    description = description.trim();
    description && (description = description.split('\n').join('<br/>').trim() + '<br/><br/>');
    return description;
}

window.searchForCodeErrors = async function searchForCodeErrors(location, code, codeName, methodSignature, replaces, noCode) {
    var knownFunctionalities = {
        "getMinimumBlockNumberForSurvey" : true,
        "getMinimumBlockNumberForEmergencySurvey" : true,
        "getEmergencySurveyStaking" : true,
        "getQuorum" : true,
        "getSurveySingleReward" : true,
        "getSurveyMinimumStaking" : true,
        "getIndex" : true,
        "getLink" : true,
        "getVotesHardCap" : true
    };
    var errors = [];
    var comments = code ? window.extractComment(code) : {};
    if ((codeName || (!codeName && !replaces)) && !comments.Description) {
        errors.push('Missing description!');
    }
    if ((codeName || (!codeName && !replaces)) && !comments.Discussion) {
        !knownFunctionalities[codeName] && errors.push('Missing discussion Link!');
    }
    if (codeName && replaces && !comments.Update) {
        errors.push('Missing update text!');
    }
    if (codeName && !location) {
        errors.push('Missing location address!');
    }
    if (codeName && !code) {
        errors.push('Missing code!');
    }
    if (codeName && !methodSignature) {
        errors.push('Missing method signature!');
    }
    if (!location || !code || noCode === true) {
        return errors;
    }
    try {
        var compare = await window.SolidityUtilities.compare(location, code);
        if (!compare) {
            errors.push('Code and location are not aligned');
        }
        if (compare) {
            var increment = 0;
            for (var i in compare.abi) {
                var element = compare.abi[i];
                if (element.type === 'function') {
                    increment++;
                    if (element.type === 'constructor' || element.stateMutability === 'view' || element.stateMutability === 'pure') {
                        increment--;
                    } else if (element.name === 'onStart' && element.inputs.length === 2 && element.inputs[0].type === 'address' && element.inputs[1].type === 'address') {
                        increment--;
                    } else if (element.name === 'onStop' && element.inputs.length === 1 && element.inputs[0].type === 'address') {
                        increment--;
                    }
                }
            }
            if (increment > 1) {
                errors.push('Possible Security Issue: This contract contains more than 1 public method');
            }
        }
        if (compare && codeName && !window.methodSignatureMatch(methodSignature, compare)) {
            errors.push('Wrong Method signature ' + methodSignature + ' for the given contract!');
        }
    } catch (e) {}
    return errors;
};

window.tokenPercentage = function tokenPercentage(amount, totalSupply) {
    amount = (amount && amount.value) || amount;
    amount = (typeof amount).toLowerCase() === 'string' ? parseInt(amount) : amount;
    totalSupply = (totalSupply && totalSupply.value) || totalSupply;
    totalSupply = (typeof totalSupply).toLowerCase() === 'string' ? parseInt(totalSupply) : totalSupply;
    if (!amount) {
        return '0%';
    }

    var percentage = (amount / (totalSupply / 100));
    return Math.round(percentage) + '%';
};

window.getDFOLogs = async function getDFOLogs(args) {
    window.dfoEvent = window.dfoEvent || window.web3.utils.sha3('Event(string,bytes32,bytes32,bytes)');
    var logArgs = {
        topics: [
            window.dfoEvent
        ],
        fromBlock: '0',
        toBlock: 'latest'
    };
    args.address && (logArgs.address = args.address);
    args.event && logArgs.topics.push(args.event.indexOf('0x') === 0 ? args.event : window.web3.utils.sha3(args.event));
    args.topics && logArgs.topics.push(...args.topics);
    args.fromBlock && (logArgs.fromBlock = args.fromBlock);
    args.toBlock && (logArgs.toBlock = args.toBlock);
    return window.formatDFOLogs(await window.getLogs(logArgs), args.event && args.event.indexOf('0x') === -1 ? args.event : undefined);
};

window.formatDFOLogs = function formatDFOLogs(logVar, event) {
    if (!logVar || (!this.isNaN(logVar.length) && logVar.length === 0)) {
        return logVar;
    }
    var logs = [];
    if (logVar.length) {
        logs.push(...logVar);
    } else {
        event = event || logVar.event;
        logs.push(logVar);
    }
    var deployArgs = [];
    if (event) {
        var rebuiltArgs = event.substring(event.indexOf('(') + 1);
        rebuiltArgs = JSON.parse('["' + rebuiltArgs.substring(0, rebuiltArgs.indexOf(')')).split(',').join('","') + '"]');
        for (var i in rebuiltArgs) {
            if (!rebuiltArgs[i].endsWith('_indexed')) {
                deployArgs.push(rebuiltArgs[i]);
            }
        }
    }
    for (var i in logs) {
        var log = logs[i];
        log.topics && log.topics.splice(0, 1);
        log.raw && log.raw.topics && log.raw.topics.splice(0, 1);
        try {
            log.data && (log.data = web3.eth.abi.decodeParameter("bytes", log.data));
            log.raw && log.raw.data && (log.raw.data = web3.eth.abi.decodeParameter("bytes", log.raw.data));
        } catch (e) {}
        if (deployArgs.length > 0 && (deployArgs.length > 1 || deployArgs[0] !== "")) {
            var data = web3.eth.abi.decodeParameters(deployArgs, log.data || (log.raw && log.raw.data));
            log.data && (log.data = []);
            log.raw && log.raw.data && (log.raw.data = []);
            Object.keys(data).map(key => {
                if (isNaN(parseInt(key))) {
                    return;
                }
                log.data && log.data.push(data[key]);
                log.raw && log.raw.data && log.raw.data.push(data[key]);
            });
        }
    }
    return logVar.length ? logs : logVar;
};

window.sendGeneratedProposal = function sendGeneratedProposal(element, ctx, template, lines, descriptions, updates) {
    var initialContext = {
        element,
        functionalityName: '',
        functionalitySubmitable: true,
        functionalityMethodSignature: 'callOneTime(address)',
        functionalityReplace: '',
        functionalityInternal: false,
        functionalityNeedsSender: false,
        functionalityReplace: '',
        emergency: false,
        template,
        lines,
        descriptions,
        updates,
        sequentialOps: template && [{
            name: 'Generating Smart Contract proposal',
            async call(data) {
                var generatedAndCompiled = await window.generateAndCompileContract(data.template, data.lines, data.descriptions, data.updates);
                data.sourceCode = generatedAndCompiled.sourceCode;
                data.selectedContract = generatedAndCompiled.selectedContract;
            }
        }]
    }
    ctx = ctx || {};
    ctx.sequentialOps && ctx.sequentialOps.push(initialContext.sequentialOps[0]);
    Object.keys(ctx).map(key => initialContext[key] = ctx[key]);
    window.showProposalLoader(initialContext);
};

window.generateAndCompileContract = async function generateAndCompileContract(sourceCode, lines, descriptions, updates) {
    sourceCode = JSON.parse(JSON.stringify(sourceCode));

    if (lines && lines.length) {
        for (var i = lines.length - 1; i >= 0; i--) {
            sourceCode.splice(4, 0, '        ' + lines[i]);
        }
    }

    var compilers = (await window.SolidityUtilities.getCompilers()).releases;
    var version = Object.keys(compilers)[0];
    sourceCode.unshift('');
    sourceCode.unshift('pragma solidity ^' + version + ';');

    if (updates && updates.length) {
        sourceCode.unshift(' */');
        for (var i = updates.length - 1; i >= 0; i--) {
            sourceCode.unshift(' * ' + updates[i]);
        }
        sourceCode.unshift('/* Update:');
    }

    sourceCode.unshift(' */');
    for (var i = descriptions.length - 1; i >= 0; i--) {
        sourceCode.unshift(' * ' + descriptions[i]);
    }
    sourceCode.unshift('/* Description:');

    sourceCode = sourceCode.join('\n');
    return {
        sourceCode,
        selectedContract: (await window.SolidityUtilities.compile(sourceCode, compilers[version])).optimized.DFOHubGeneratedProposal
    }
};

window.showProposalLoader = async function showProposalLoader(initialContext) {
    var sequentialOps = initialContext.sequentialOps || [];
    delete initialContext.sequentialOps;
    window.functionalitySourceId && (initialContext.functionalitySourceId = window.functionalitySourceId);
    (!initialContext.functionalitySourceId && (initialContext.sourceCode || initialContext.template)) && sequentialOps.push({
        name: "Publishing Smart Contract Code",
        async call(data) {
            data.functionalitySourceId = await window.mint(window.split(data.sourceCode), undefined, true);
            data.editor && data.editor.contentTokenInput && (data.editor.contentTokenInput.value = data.functionalitySourceId);
        }
    });
    (!initialContext.functionalityAddress && (initialContext.selectedContract || initialContext.template)) && sequentialOps.push({
        name: "Deploying Smart Contract",
        async call(data) {
            if (data.contractName && data.functionalitySourceId && data.selectedSolidityVersion) {
                var code = await window.loadContent(data.functionalitySourceId);
                var compiled = await window.SolidityUtilities.compile(code, data.selectedSolidityVersion, 200);
                data.selectedContract = compiled[data.contractName];
            }
            var args = [
                data.selectedContract.abi,
                data.selectedContract.bytecode
            ];
            data.constructorArguments && Object.keys(data.constructorArguments).map(key => args.push(data.constructorArguments[key]));
            data.functionalityAddress = (await window.createContract.apply(window, args)).options.address;
            data.editor && data.editor.functionalityAddress && (data.editor.functionalityAddress.value = data.functionalityAddress);
        }
    });
    if (initialContext.emergency) {
        var approved = parseInt(await window.blockchainCall(initialContext.element.token.methods.allowance, window.walletAddress, initialContext.element.dFO.options.address));
        approved < parseInt(initialContext.element.emergencySurveyStaking) && sequentialOps.push({
            name: 'Approving ' + window.fromDecimals(initialContext.element.emergencySurveyStaking, initialContext.element.decimals) + ' ' + initialContext.element.symbol + ' for Emergency Staking',
            async call(data) {
                await window.blockchainCall(data.element.token.methods.approve, initialContext.element.dFO.options.address, data.element.emergencySurveyStaking);
            }
        });
    }
    sequentialOps.push({
        name: 'Publishing Proposal...',
        async call(data) {
            data.transaction = await window.blockchainCall(
                data.element.dFO.methods.newProposal,
                data.functionalityName,
                data.emergency,
                window.getNetworkElement('defaultOcelotTokenAddress'),
                isNaN(data.functionalitySourceId) ? 0 : data.functionalitySourceId,
                window.hasEthereumAddress(data.functionalityAddress) ? data.functionalityAddress : window.voidEthereumAddress,
                data.functionalitySubmitable,
                data.functionalityMethodSignature || "",
                data.functionalityOutputParameters || "",
                data.functionalityInternal,
                data.functionalityNeedsSender,
                data.functionalityReplace
            );
            if (!parseInt(data.element.minimumStaking)) {
                $.publish('loader/toggle', false);
                $.publish('message', 'Proposal Sent!', 'info');
                $.publish('section/change', 'Proposals');
            }
        }
    });
    parseInt(initialContext.element.minimumStaking) && sequentialOps.push({
        name: 'Sending Initial ' + window.fromDecimals(initialContext.element.minimumStaking, initialContext.element.decimals) + ' ' + initialContext.element.symbol + ' for Staking',
        async call(data) {
            await window.blockchainCall(window.newContract(window.context.propsalAbi, data.transaction.events.Proposal.returnValues.proposal).methods.accept, window.numberToString(data.element.minimumStaking));
            $.publish('loader/toggle', false);
            $.publish('message', 'Proposal Sent!', 'info');
            $.publish('section/change', 'Proposals');
        }
    });
    $.publish('loader/toggle', [true, sequentialOps, initialContext]);
};

window.toEthereumSymbol = function toEthereumSymbol(decimals) {
    var symbols = {
        "noether": "0",
        "wei": "1",
        "kwei": "1000",
        "Kwei": "1000",
        "babbage": "1000",
        "femtoether": "1000",
        "mwei": "1000000",
        "Mwei": "1000000",
        "lovelace": "1000000",
        "picoether": "1000000",
        "gwei": "1000000000",
        "Gwei": "1000000000",
        "shannon": "1000000000",
        "nanoether": "1000000000",
        "nano": "1000000000",
        "szabo": "1000000000000",
        "microether": "1000000000000",
        "micro": "1000000000000",
        "finney": "1000000000000000",
        "milliether": "1000000000000000",
        "milli": "1000000000000000",
        "ether": "1000000000000000000",
        "kether": "1000000000000000000000",
        "grand": "1000000000000000000000",
        "mether": "1000000000000000000000000",
        "gether": "1000000000000000000000000000",
        "tether": "1000000000000000000000000000000"
    };
    var d = "1" + (new Array(decimals + 1)).join('0');
    var values = Object.entries(symbols);
    for(var i in values) {
        var symbol = values[i];
        if(symbol[1] === d) {
            return symbol[0];
        }
    }
};

window.dumpFunctionalities = async function dumpFunctionalities(dfo) {
    await window.loadFunctionalities(dfo, undefined, true);
    var entries = ["        IMVDFunctionalitiesManager functionalitiesManager = IMVDFunctionalitiesManager(address(0));"];
    entries.push(...Object.values(dfo.functionalities).map(it => `functionalitiesManager.addFunctionality("${it.codeName}", ${window.web3.utils.toChecksumAddress(it.sourceLocation)}, ${it.sourceLocationId}, ${window.web3.utils.toChecksumAddress(it.location)}, ${it.submitable}, "${it.methodSignature}", '${JSON.stringify(it.returnAbiParametersArray)}', ${it.isInternal}, ${it.needsSender});`));
    return entries.join('\n        ');
};