var DFOMetadataEdit = React.createClass({
    extractData() {
        var data = window.getData(this.domRoot);
        !data.brandUri && this.props.data && (data.brandUri = this.props.data.brandUri);
        !data.logoUri && this.props.data && (data.logoUri = this.props.data.logoUri);
        return data;
    },
    getData() {
        return window.validateDFOMetadata(this.extractData(), true);
    },
    setData(originalData) {
        if(!originalData) {
            return;
        }
        var data = {};
        Object.entries(originalData).forEach(it => data[it[0]] = it[1]);
        delete data.brandUri;
        delete data.logoUri;
        window.setData(this.domRoot, data);
    },
    proposeChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        window.proposeNewMetadataLink(this.props.element, this.extractData()).then(() => this.emit('metadata/edit/close'));
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
            <a className="METADATACHANGECLOSE" onClick={this.back}>Back</a>
            <div className="InsertDfoSubdomain">
                <label className="LabelSPEC" htmlFor="shortDescription">BIO:</label>
                <textarea className="LabelSPECWRITE" id="shortDescription" type="text"></textarea>
            </div>
            <div className="InsertDfoName">
                <label htmlFor="name">DFO Name:</label>
                <input autocomplete="off" id="name" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="brandUri">DFO Logo:</label>
                <input id="brandUri" type="file" accepts="image/*" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="logoUri">Token Logo:</label>
                <input id="logoUri" type="file" accepts="image/*" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="discussionUri">Chat Link:</label>
                <input id="discussionUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="repoUri">Repo link:</label>
                <input id="repoUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="wpUri">Explainer link:</label>
                <input id="wpUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="roadmapUri">Roadmap link:</label>
                <input id="wpUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="externalDNS">External link:</label>
                <input id="externalDNS" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="externalENS">External ENS link:</label>
                <input id="externalENS" type="text" />
            </div>
            </section>
        </section>);
    }
});