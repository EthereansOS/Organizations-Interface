var PairChooser = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
    setPair(token0, token1, selection) {
        this.controller.setPair(token0, token1, selection);
    },
    componentDidMount() {
        this.props.pair && this.setPair(this.props.pair.token0.address, this.props.pair.token1.address);
        !this.props.pair && this.setPair(this.props.token0, this.props.token1);
    },
    onSelectionChange(e) {
        this.setState({ selection: e.currentTarget.dataset.selection }, this.controller.checkApproveAndBalances);
    },
    onAmountChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        _this.amountChangeTimeout && window.clearTimeout(_this.amountChangeTimeout);
        _this.amountChangeTimeout = window.setTimeout(_this.controller.recalculateRoutesAndPrices, 400);
    },
    max(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.amount.value = window.fromDecimals(this.state.balance, this.state.pair[this.state.selection].decimals, true);
        this.controller.recalculateRoutesAndPrices();
    },
    perform(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (e.currentTarget.className.indexOf('Disabled') !== -1 || (this.state && this.state.performing)) {
            return;
        }
        var performing = e.currentTarget.dataset.action;
        var args = [];
        var _this = this;
        _this.setState({ performing: null }, function () {
            var end = function end(errorMessage) {
                var message = errorMessage && (errorMessage.message || errorMessage);
                if (message && message.toLowerCase().indexOf('user denied') !== -1) {
                    message = undefined;
                }
                _this.setState({ performing: null }, function () {
                    message && setTimeout(function () {
                        alert(message);
                    });
                });
            };
            _this.setState({ performing }, function () {
                _this.controller["perform" + performing].apply(this, args).catch(end).finally(end);
            });
        });
    },
    renderCalculation(calculation, selection, otherToken) {
        if (!calculation) {
            return;
        }
        return (<section>
            <span>
                {window.fromDecimals(calculation.tokenGAmountIn, this.state.pair[selection].decimals)} {this.state.pair[selection].symbol} <img src={this.state.pair[selection].logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenLAmountIn, this.state.pair[otherToken].decimals)} {this.state.pair[otherToken].symbol} <img src={this.state.pair[otherToken].logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenTAmountIn, this.state.tokenT.decimals)} {this.state.tokenT.symbol} <img src={this.state.tokenT.logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenGAmountOut, this.state.pair[selection].decimals)} {this.state.pair[selection].symbol} <img src={this.state.pair[selection].logo} />
            </span>
        </section>);
    },
    render() {
        return (<section>
            {this.state && this.state.pair && <section>
                <section>
                    <img src={this.state.pair.token0.logo} />
                    <span>{this.state.pair.token0.name}</span>
                    <span>({this.state.pair.token0.symbol})</span>
                    <input type="radio" name="selection" data-selection="token0" checked={this.state.selection === 'token0'} onChange={this.onSelectionChange} />
                </section>
                <section>
                    <img src={this.state.pair.token1.logo} />
                    <span>{this.state.pair.token1.name}</span>
                    <span>({this.state.pair.token1.symbol})</span>
                    <input type="radio" name="selection" data-selection="token1" checked={this.state.selection === 'token1'} onChange={this.onSelectionChange} />
                </section>
                <section>
                    <section>
                        <a href="javascript:;" onClick={this.max}>Max</a>
                        <input type="text" ref={ref => this.amount = ref} onChange={this.onAmountChange} />
                    </section>
                    {this.state.balance && <section>
                        Balance: <span>{window.fromDecimals(this.state.balance, this.state.pair[this.state.selection].decimals)}</span> <span>{this.state.pair[this.state.selection].symbol}</span>
                    </section>}
                </section>
                <section>
                    {this.state.performing !== 'Approve' && <a href="javascript:;" data-action="Approve" onClick={this.perform} className={"ApproveButton" + (this.state.approved ? " Disabled" : "")}>Approve</a>}
                    {this.state.performing === 'Approve' && <LoaderMinimino/>}
                    {this.state.performing !== 'Camp' && <a href="javascript:;" data-action="Camp" onClick={this.perform} className={"CampButton" + (!this.state.approved || this.state.performing ? " Disabled" : "")}>Camp</a>}
                    {this.state.performing === 'Camp' && <LoaderMinimino />}
                </section>
                {this.state.calculation && <section>
                    {this.renderCalculation(this.state.calculation.token0, 'token0', 'token1')}
                    {this.renderCalculation(this.state.calculation.token0, 'token1', 'token0')}
                </section>}
            </section>}
        </section>);
    }
});