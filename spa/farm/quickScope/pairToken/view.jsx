var PairToken = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
    onAmountChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        _this.amountChangeTimeout && window.clearTimeout(_this.amountChangeTimeout);
        _this.amountChangeTimeout = window.setTimeout(() => _this.controller.recalculateRoutesAndPrices(_this), 400);
    },
    max(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.amount.value = window.fromDecimals(this.state.balance, this.props.pair[this.props.selection].decimals, true);
        this.controller.recalculateRoutesAndPrices(this);
    },
    perform(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (e.currentTarget.className.indexOf('Disabled') !== -1 || (this.state && this.state.performing) || this.props.lock) {
            return;
        }
        var performing = e.currentTarget.dataset.action;
        var args = [this];
        var _this = this;
        _this.setState({ performing: null }, function () {
            var end = function end(errorMessage) {
                var message = errorMessage && (errorMessage.message || errorMessage);
                if (message && message.toLowerCase().indexOf('user denied') !== -1) {
                    message = undefined;
                }
                _this.setState({ performing: null }, function () {
                    _this.emit('quickScope/lock', false);
                    message && setTimeout(function () {
                        alert(message);
                    });
                });
            };
            _this.setState({ performing }, function () {
                _this.emit('quickScope/lock', true);
                setTimeout(function() {
                    _this.controller["perform" + performing].apply(_this, args).catch(end).finally(end);
                });
            });
        });
    },
    renderCalculation(calculation, selection, otherToken) {
        if (!calculation) {
            return;
        }
        return (<section>
            <span>
                {window.fromDecimals(calculation.tokenGAmountIn, this.props.pair[selection].decimals)} {this.props.pair[selection].symbol} <img src={this.props.pair[selection].logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenLAmountIn, this.props.pair[otherToken].decimals)} {this.props.pair[otherToken].symbol} <img src={this.props.pair[otherToken].logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenTAmountIn, this.props.tokenT.decimals)} {this.props.tokenT.symbol} <img src={this.props.tokenT.logo} />
            </span>
            {">"}
            <span>
                {window.fromDecimals(calculation.tokenGAmountOut, this.props.pair[selection].decimals)} {this.props.pair[selection].symbol} <img src={this.props.pair[selection].logo} />
            </span>
        </section>);
    },
    componentDidMount() {
        this.amount.value = '1';
        this.controller.recalculateRoutesAndPrices(this);
    },
    render() {
        var selection = this.props.selection;
        var otherSelection = this.controller.getOtherSelection(this);
        return (<section>
                <section>
                    <h4>Free {this.props.pair[selection].symbol}</h4>
                </section>
                <section>
                    <img src={this.props.pair[selection].logo} />
                    <span>{this.props.pair[selection].name}</span>
                    <span>({this.props.pair[selection].symbol})</span>
                </section>
                <section>
                    <img src={this.props.pair[otherSelection].logo} />
                    <span>{this.props.pair[otherSelection].name}</span>
                    <span>({this.props.pair[otherSelection].symbol})</span>
                </section>
                <section>
                    <section>
                        <a href="javascript:;" onClick={this.max}>Max</a>
                        <input type="text" ref={ref => this.amount = ref} onChange={this.onAmountChange} />
                    </section>
                    {this.state && this.state.balance && <section>
                        Balance: <span>{window.fromDecimals(this.state.balance, this.props.pair[this.props.selection].decimals)}</span> <span>{this.props.pair[this.props.selection].symbol}</span>
                    </section>}
                </section>
                {this.state && <section>
                    {this.state.performing !== 'Approve' && <a href="javascript:;" data-action="Approve" onClick={this.perform} className={"ApproveButton" + (this.state.approved || this.props.lock ? " Disabled" : "")}>Approve</a>}
                    {this.state.performing === 'Approve' && <LoaderMinimino/>}
                    {this.state.performing !== 'QuickScope' && <a href="javascript:;" data-action="QuickScope" onClick={this.perform} className={"QuickScopeButton" + (!this.state.approved || this.state.performing || this.props.lock ? " Disabled" : "")}>Quick Scope</a>}
                    {this.state.performing === 'QuickScope' && <LoaderMinimino />}
                </section>}
                {this.state && this.state.calculation && <section>
                    {this.renderCalculation(this.state.calculation, selection, otherSelection)}
                </section>}
        </section>);
    }
});