var DeFiOffering = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino'
    ],
    uploadFile(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var file = e.currentTarget.files[0];
        var _this = this;
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            _this.indexValue.value = reader.result;
        }, false);
        reader.readAsDataURL(file);
    },
    changeElementInfo(e) {
        if (!e) {
            return;
        }
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var data = window.getData($($(e.currentTarget).parent()).parent());
        this.controller[this.state.change + 'Change'](data);
    },
    componentDidMount() {
        var _this = this;
        window.blockchainCall(_this.props.element.dFO.methods.read, 'getMinimumBlockNumberForSurvey', '0x').then(blocks => {
            _this.props.element.blocks = window.web3.eth.abi.decodeParameters(['uint256'], blocks)[0];
            _this.forceUpdate();
        });
    },
    renderChangeButton(name) {
        var _this = this;
        if (!_this.props.edit) {
            return;
        }
        return (<a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.change === name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === name ? null : name })}>Change</a>);
    },
    renderChanger(args) {
        var _this = this;
        if (!_this.props.edit || !_this.state || !_this.state.change) {
            return;
        }
        for (var i in args) {
            var name = args[i];
            if (_this.state.change === name) {
                var method = _this['render' + name.substring(0, 1).toUpperCase() + name.substring(1) + 'Changer'];
                return (<section className="DFOFunctionIndexIcon">
                    {method && method()}
                    <aside>
                        <a href="javascript:;" className="LinkVisualButton LinkVisualButtonB" onClick={_this.changeElementInfo}>Propose</a>
                    </aside>
                </section>);
            }
        }
    },
    renderDefaultChanger(text, label, id, defaultValue) {
        return (
            <ul>
                <li>
                    <p ref={ref => ref && (ref.innerHTML = text)}>{text}</p>
                </li>
                <li>
                    <section>
                        <label htmlFor={id} ref={ref => ref && (ref.innerHTML = label)}>{label}</label>
                        <input className="DFOFunctionIndexIconText" id={id} type="number" min="0" ref={ref => ref && (ref.value = defaultValue)} />
                    </section>
                </li>
            </ul>
        );
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                <ul className="DFOHosting">
                <section className="HostingCategoryTitle">
                        <h2>Dex Open Liquidity</h2>
                    </section>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Remove Liquidity</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Add Liquidity</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                </ul>
            </section>
        );
    }
});