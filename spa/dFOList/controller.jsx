var DFOListController = function (view) {
    var context = this;
    context.view = view;

    context.blockSearchSize = 40000;
    context.dfoDeployedEvent = "DFODeployed(address_indexed,address)";
    context.newDfoDeployedEvent = "DFODeployed(address_indexed,address_indexed,address,address)";

    context.loadList = async function loadList() {
        context.alreadyLoaded = {};
        (context.running = true) && context.loadEvents();
    };

    context.loadEvents = async function loadEvents(topics, toBlock, lastBlockNumber) {
        if (!context.running || toBlock === window.getNetworkElement("deploySearchStart")) {
            delete context.running;
            return context.view.forceUpdate();
        }
        lastBlockNumber = lastBlockNumber || await web3.eth.getBlockNumber();
        toBlock = toBlock || lastBlockNumber;
        var fromBlock = toBlock - context.blockSearchSize;
        var startBlock = window.getNetworkElement("deploySearchStart");
        fromBlock = fromBlock > startBlock ? startBlock : toBlock;
        var newEventLogs = await context.getLogs(fromBlock, toBlock, context.newDfoDeployedEvent);
        var oldEventLogs = await context.getLogs(fromBlock, toBlock, context.dfoDeployedEvent);
        (newEventLogs.length > 0 || oldEventLogs.length > 0) && setTimeout(() => {
            try {
                context.view.forceUpdate();
            } catch (e) {
            }
        });
        setTimeout(() => context.loadEvents(topics, fromBlock, lastBlockNumber));
    }

    context.getLogs = async function getLogs(fromBlock, toBlock, event) {
        var logs = await window.getDFOLogs({
            address: window.dfoHub.dFO.options.allAddresses,
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
            !window.list[key] && (window.list[key] = {
                key,
                startBlock: log.blockNumber,
                dFO: await window.loadDFO(log.data[0])
            });
        }
        return logs;
    };

    context.getLatestSearchBlock = function getLatestSearchBlock() {
        return (window.list && Object.keys(window.list).length > 0 && Math.max(...Object.keys(window.list).map(it => parseInt(it.split('_')[0])))) || window.getNetworkElement('deploySearchStart');
    };
};