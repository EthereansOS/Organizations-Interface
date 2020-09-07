var VotingTokenData = React.createClass({
    getData() {
        var _this = this;
        var data = window.getData(_this.domRoot);
        return (new Promise(function (ok, ko) {
            var errors = [];
            !data.tokenSymbol && errors.push('Insert a valid Token Symbol');
            (isNaN(data.tokenTotalSupply) || data.tokenTotalSupply <= 0) && errors.push('Token Total Supply must be greater than 0');
            if (errors.length > 0) {
                return ko(errors);
            }
            data.totalSupplyWei = window.toDecimals(data.tokenTotalSupply, 18);
            _this.retrieveVotingTokensAmountForHub(data.tokenTotalSupply).then(result => {
                data.availableSupply = result.available;
                return ok(data);
            });
        }));
    },
    retrieveVotingTokensAmountForHub(totalSupply) {
        var totalSupplyWei = window.toDecimals(totalSupply, 18);
        return window.blockchainCall(window.dfoHub.dFO.methods.read, 'getVotingTokenAmountForHub', window.web3.eth.abi.encodeParameter('uint256', totalSupplyWei)).then(result => {
            result = window.web3.eth.abi.decodeParameter('uint256', result);
            return {
                result,
                available: window.web3.utils.toBN(totalSupplyWei).sub(window.web3.utils.toBN(result)).toString()
            };
        });
    },
    onChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        _this.tokenSymbolLabel.innerHTML = _this.tokenSymbol.value;
        var totalSupply = parseFloat(_this.totalSupply.value.split(',').join(''));
        totalSupply = isNaN(totalSupply) ? 0 : totalSupply;
        _this.retrieveVotingTokensAmountForHub(totalSupply).then(result => {
            _this.amountForHub.innerHTML = window.fromDecimals(result.result, 18);
        });
    },
    retrieveAmountPercentage(ref) {
        ref && this.retrieveVotingTokensAmountForHub(100).then(result => ref.innerHTML = window.fromDecimals(result.result, 18));
    },
    render() {
        return (<section>
            <p><span>2 of 3 | Voting Token</span><br></br>The Voting Token of a DFO is an ERC20 Token. The Voting Token is the key to rule the DFO functionalities and its assets. If you lose your voting tokens, there is no way to be part of the future DFO's decisions.</p>
            <section className="DeployNewWhat">
                <div className="InsertDfoName">
                    <label htmlFor="dfoName">Name:</label>
                    <input autocomplete="off" id="dfoName" type="text" />
                </div>
                <div className="InsertTokenName">
                    <label htmlFor="tokenSymbol">Symbol:</label>
                    <input ref={ref => this.tokenSymbol = ref} autocomplete="off" id="tokenSymbol" type="text" onChange={this.onChange} />
                </div>
                <div className="InsertTokenSupply">
                    <label htmlFor="tokenTotalSupply">Supply:</label>
                    <input id="tokenTotalSupply" type="number" min="1" ref={ref => this.totalSupply = ref} onChange={this.onChange} />
                    <aside><b>Generation Fee:</b> <span ref={this.retrieveAmountPercentage}></span>% <span>(<span ref={ref => this.amountForHub = ref}>0</span> <span ref={ref => this.tokenSymbolLabel = ref}></span>)</span></aside>
                </div>
            </section>
        </section>);
    }
});