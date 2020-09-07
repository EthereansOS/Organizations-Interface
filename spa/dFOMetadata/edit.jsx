var DFOMetadataEdit = React.createClass({
    extractData() {
        var data = window.getData(this.domRoot);
        (!data.brandUri || data.brandUri.length === 0) && this.props.data && (data.brandUri = this.props.data.brandUri instanceof Array ? this.props.data.brandUri[0] : this.props.data.brandUri);
        (!data.logoUri || data.logoUri.length === 0) && this.props.data && (data.logoUri = this.props.data.logoUri instanceof Array ? this.props.data.logoUri[0] : this.props.data.logoUri);
        return data;
    },
    getData() {
        return window.validateDFOMetadata(this.extractData(), true);
    },
    setData(originalData) {
        if (!originalData) {
            return;
        }
        var data = {};
        Object.entries(originalData).forEach(it => data[it[0]] = it[1]);
        (typeof data.brandUri === 'string' || data.brandUri instanceof Array) && delete data.brandUri;
        (typeof data.logoUri === 'string' || data.logoUri instanceof Array) && delete data.logoUri;
        window.setData(this.domRoot, data);
    },
    proposeChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        _this.setState({performing : 'propose'}, function() {
            window.proposeNewMetadataLink(_this.props.element, _this.extractData()).then(() => _this.emit('metadata/edit/close')).catch(e => _this.emit('message', e.message || e, 'error')).finally(function() {
                _this.setState({performing : null});
            });
        });
    },
    back(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('metadata/edit/close');
    },
    componentDidMount() {
        this.setData(this.props.data);
    },
    render() {
        return (<section className={"DeployNewWhat " + this.props.className}>
            <section className="DeployNewWhat3">
                <h2 className="METADATACHANGE">Propose Metadata Change</h2>
                <a className="METADATACHANGECLOSE" href="javascript:;" onClick={this.back}>Back</a>
                <div className="InsertDfoSubdomain">
                    <label className="LabelSPEC" htmlFor="shortDescription">BIO:</label>
                    <textarea className="LabelSPECWRITE" id="shortDescription" type="text"></textarea>
                </div>
                <p className="OkBoomer">A brief description of the organization <div className="BoomerTriangle"/></p>
                <div className="InsertDfoName">
                    <label htmlFor="name">DFO Name:</label>
                    <input autocomplete="off" id="name" type="text" />
                </div>
                <p className="OkBoomer">The name of the organization<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="brandUri">DFO Logo:</label>
                    <input id="brandUri" type="file" accepts="image/*" />
                </div>
                <p className="OkBoomer">The logo of the organization (must be a .png 350 x 350 pixels)<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="logoUri">Token Logo:</label>
                    <input id="logoUri" type="file" accepts="image/*" />
                </div>
                <p className="OkBoomer">The logo of the Voting Token (must be a .png 350 x 350 pixels)<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="discussionUri">Chat Link:</label>
                    <input id="discussionUri" type="text" />
                </div>
                <p className="OkBoomer">A link to the official community of the organization (ex. Riot, Discord, Telegram)<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="repoUri">Repo link:</label>
                    <input id="repoUri" type="text" />
                </div>
                <p className="OkBoomer">A link to the official R&D repository<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="wpUri">Explainer link:</label>
                    <input id="wpUri" type="text" />
                </div>
                <p className="OkBoomer">A link to an external source that explain the plan of the organization<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="roadmapUri">Roadmap link:</label>
                    <input id="roadmapUri" type="text" />
                </div>
                <p className="OkBoomer">A link to an external source that provide the roadmap of the project<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="externalDNS">External link:</label>
                    <input id="externalDNS" type="text" />
                </div>
                <p className="OkBoomer">A link to an external webpage to use the application (if any).<div className="BoomerTriangle"/></p>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="externalENS">External ENS link:</label>
                    <input id="externalENS" type="text" />
                </div>
                <p className="OkBoomer">A link to an external ENS webpage to use the application (if any).<div className="BoomerTriangle"/></p>
            </section>
            {this.props.showCommands && <section className="PROPOSEmetadata">
                <br/>
                {(!this.state || this.state.performing !== 'propose') && <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" onClick={this.proposeChange}>Propose</a>}
                {this.state && this.state.performing === 'propose' && <section className="loaderMinimino"/>}
            </section>}
        </section>);
    }
});