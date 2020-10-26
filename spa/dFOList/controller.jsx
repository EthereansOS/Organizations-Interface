var DFOListController = function (view) {
    var context = this;
    context.view = view;

    context.blockSearchSize = 40000;
    context.dfoDeployedEvent = "DFODeployed(address_indexed,address)";
    context.newDfoDeployedEvent = "DFODeployed(address_indexed,address_indexed,address,address)";

    context.loadList = async function loadList() {
        context.alreadyLoaded = {};
        (context.running = await context.loadTestDFOs()) && context.loadEvents();
    };

    context.loadTestDFOs = async function loadTestDFOs() {
        if(window.context.testDFOs && window.context.testDFOs.length > 0) {
            var startBlock = window.getNetworkElement("deploySearchStart");
            window.context.testDFOs.forEach(key => context.loadDFO(key, key, startBlock));
        }
        return true;
    };

    context.loadEvents = async function loadEvents(topics, toBlock, lastBlockNumber) {
        if (!context.running || toBlock === window.getNetworkElement("deploySearchStart")) {
            delete context.running;
            return context.view.mounted && context.view.forceUpdate();
        }
        lastBlockNumber = lastBlockNumber || await web3.eth.getBlockNumber();
        toBlock = toBlock || lastBlockNumber;
        var fromBlock = toBlock - context.blockSearchSize;
        var startBlock = window.getNetworkElement("deploySearchStart");
        fromBlock = fromBlock > startBlock ? startBlock : toBlock;
        context.getLogs(fromBlock, toBlock, context.newDfoDeployedEvent);
        context.getLogs(fromBlock, toBlock, context.dfoDeployedEvent);
        setTimeout(() => context.loadEvents(topics, fromBlock, lastBlockNumber));
    }

    context.getLogs = async function getLogs(fromBlock, toBlock, event, topics) {
        var logs = await window.getDFOLogs({
            address: window.dfoHub.dFO.options.allAddresses,
            topics,
            event,
            fromBlock: '' + fromBlock,
            toBlock: '' + toBlock
        });
        for (var log of logs) {
            if(context.alreadyLoaded[log.data[0].toLowerCase()]) {
                continue;
            }
            context.alreadyLoaded[log.data[0].toLowerCase()] = true;
            var key = log.blockNumber + '_' + log.id;
            !context.isInList(key) && context.loadDFO(log.data[0], key, log.blockNumber);
        }
        return logs;
    };

    context.getLatestSearchBlock = function getLatestSearchBlock() {
        return (window.list && Object.keys(window.list).length > 0 && Math.max(...Object.keys(window.list).map(it => parseInt(it.split('_')[0])))) || window.getNetworkElement('deploySearchStart');
    };

    context.isInList = function isInList(key) {
        if(window.list[key]) {
            return true;
        }
        if(!key.dFO) {
            try {
                key = window.web3.utils.toChecksumAddress(key);
            } catch(e) {
                return false;
            }
            if(Object.values(window.list).filter(it => it.dFO.options.allAddresses.filter(addr => window.web3.utils.toChecksumAddress(addr) === key).length > 0).length > 0) {
                return true;
            }
        } else {
            var keys = key.dFO.options.allAddresses.map(it => window.web3.utils.toChecksumAddress(it));
            var list = Object.values(window.list).map(it => it.dFO.options.allAddresses.map(it => window.web3.utils.toChecksumAddress(it)));
            for(var addresses of list) {
                for(var address of addresses) {
                    if(keys.indexOf(address) != -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    context.loadDFO = function loadDFO(address, key, startBlock) {
        window.loadDFO(address).then(dFO => {
            !context.isInList(key) && (window.list[key] = {
                key,
                startBlock,
                dFO
            }) && context.view.mounted && context.view.forceUpdate();
        });
    }
};