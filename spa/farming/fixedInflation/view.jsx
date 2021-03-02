var FixedInflationView = React.createClass({
    requiredScripts : [
        'spa/loaderMinimino.jsx',
        'spa/farming/fixedInflation/edit.jsx',
        'spa/farming/fixedInflation/viewWrapped.jsx'
    ],
    getDefaultSubscriptions() {
        var _this = this;
        return {
            'fixedInflation/edit/open' : function(fixedInflationContractAddress) {
                _this.emit('edit/toggle', true, () => _this.setState({edit: true, fixedInflationContractAddress}))
            }
        }
    },
    cancelEdit() {
        this.setState({edit : false, fixedInflationContractAddress : null, cancelEdit : null});
    },
    calculateTimeTier() {
        if(!this.props || !this.props.fixedInflationData || !this.props.fixedInflationData.blockLimit) {
            return '';
        }
        return window.calculateTimeTier(this.props.fixedInflationData.blockLimit);
    },
    runFixedInflation(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        this.emit('message');
        window.blockchainCall(this.props.element.dFO.methods.submit, 'fixedInflation', '0x').then(() => _this.emit('fixedInflation/refresh')).catch(e => _this.emit('message', e.message || e, 'error'));
    },
    componentDidUpdate() {
        this.state && this.state.edit && !this.props.edit && this.setState({edit : false});
    },
    render() {
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        return (<ul className="DFOHosting DFOHostingBBBB">
            <section className="HostingCategoryTitle">
                <h2>Inflation</h2>
                {this.props.edit && !props.fixedInflationContractAddress && <a href="javascript:;" onClick={() => _this.setState({edit : !(_this.state && _this.state.edit)})} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.edit ? 'EditDFOYo Editing' : '')}>Create</a>}
            </section>
            {(!this.state || !this.state.edit) && (!this.props || !this.props.fixedInflationData) && <LoaderMinimino/>}
            {(!this.state || !this.state.edit) && props.dfoCore && props.dfoCore.deployedFixedInflationContracts && props.dfoCore.deployedFixedInflationContracts.length  === 0 && <h4>No Fixed inflation data</h4>}
            {(!this.state || !this.state.edit) && props.dfoCore && React.createElement(FixedInflationViewWrapped, {...props, edit : this.props.edit})}
            {this.props && this.props.edit && this.state && this.state.edit && React.createElement(FixedInflationEdit, {...props, cancelEdit : this.cancelEdit})}
        </ul>);
    }
});