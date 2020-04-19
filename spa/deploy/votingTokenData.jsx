var VotingTokenData = React.createClass({
    getData() {
        var data = window.getData(this.domRoot);
        return (new Promise(function (ok, ko) {
            var errors = [];
            !data.tokenSymbol && errors.push('Insert a valid Token Symbol');
            (isNaN(data.tokenTotalSupply) || data.tokenTotalSupply < 1) && errors.push('Token Total Supply must be greater than 1');
            if (errors.length > 0) {
                return ko(errors);
            }
            data.totalSupplyWei = window.toDecimals(data.tokenTotalSupply, 18);
            window.blockchainCall(window.dfoHub.dFO.methods.read, 'getVotingTokenAmountForHub', window.web3.eth.abi.encodeParameter('uint256', window.numberToString(data.totalSupplyWei))).then(result => {
                data.availableSupply = parseInt(window.fromDecimals(data.totalSupplyWei - parseInt(window.web3.eth.abi.decodeParameter('uint256', result)), 18));
                return ok(data);
            });
        }));
    },
    render() {
        return (<section>
            <p><span>2 of 3 | Voting Token</span><br></br>The Voting Token of a DFO is an ERC20 Token. In DFOs, the Voting Token is needed both to add, update or kill functionalities, both to edit the front-end, making the community of token holders the owners and governor of the dapp.</p>
             <section className="DeployNewWhat">
                    <div className="InsertTokenName">
                        <label htmlFor="tokenSymbol">Symbol:</label>
                        <input autocomplete="off" id="tokenSymbol" type="text" />
                    </div>
                    <div className="InsertTokenSupply">
                        <label htmlFor="tokenTotalSupply">Supply:</label>
                        <input id="tokenTotalSupply" type="number" min="1" />
                    </div>
            </section>
        </section>);
    }
});