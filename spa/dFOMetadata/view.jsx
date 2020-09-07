var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'metadata/edit/close': () => this.setState({ change: null })
        }
    },
    shortenWord(p) {
        if(!p) {
            return;
        }
        var _this = this;
        var more = this.state && this.state.more;
        var shorten = window.shortenWord(_this.props.element.shortDescription, 300);
        var html = more ? _this.props.element.shortDescription : shorten;
        p.innerHTML = html;
        if(shorten.length !== _this.props.element.shortDescription.length) {
            $(p).append($('<a href="javascript:;" class="MOREINFOSOON">' + (more ? 'Less' : 'More' ) + '</a>').click(function() {
                _this.setState({more : more ? false : true}, function() {
                    _this.shortenWord(p);
                });
            }));
        }
    },
    render() {
        var _this = this;
        if (_this.state && _this.state.change === 'edit') {
            return <DFOMetadataEdit className="DeployNewWhat2" element={_this.props.element} data={_this.props.element.metadata} showCommands={true} />;
        }
        if (!_this.props.element.metadataLink) {
            return (<ul className="DFOHosting">
                <section className="HostingCategoryTitle">
                    <h2>Organization Info</h2>
                </section>
                <section className="HostingCategoryTitle HostingCategoryTitle25">
                    <a className={"LinkVisualButton LinkVisualButtonB SpecialMetadataBTN" + (_this.state && _this.state.change === name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === 'edit' ? null : 'edit' })}>Add Metadata</a>
                </section>
            </ul>);
        }
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Organization Info {_this.props.edit && <a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.change === name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === 'edit' ? null : 'edit' })}>Change</a>}</h2>
            </section>
            <li className="TheDappInfo05 TheDappInfo1B">
                {_this.props.element.brandUri && <img className="DFObrandICON" src={window.formatLink(_this.props.element.brandUri)}></img>}
            </li>
            {_this.props.element.shortDescription && <li className="TheDappInfo2">
                <h5 className="DFOHostingTitle">BIO</h5>
                <section className="DFOTitleSection">
                    <p className="DFOLabelTitleInfo" ref={this.shortenWord}></p>
                </section>
            </li>}
            <li className="TheDappInfo1 TheDappInfo1B">
                <h5 className="DFOHostingTitle">More</h5>
                <section className="DFOTitleSection DFOTitleSectionB">
                    <a href={window.formatLink(_this.props.element.wpUri)} target="_blank" className="LinkVisualButton LinkVisualEthscan">Explainer</a>
                    <a href={window.formatLink(_this.props.element.roadmapUri)} target="_blank" className="LinkVisualButton LinkVisualEthscan">Roadmap</a>
                    <a href={window.formatLink(_this.props.element.repoUri)} target="_blank" className="LinkVisualButton LinkVisualEthscan">Ext. Repo</a>
                    <a href={window.formatLink(_this.props.element.discussionUri)} target="_blank" className="LinkVisualButton LinkVisualEthscan">Discussion</a>
                    <h5 className="DFOHostingTitle DFOHostingTitleB">Secure Domain</h5>
                    <AsyncValue>
                        {_this.props.element.ens !== undefined && <p className="DFOLabelTitleInfo"><a className="LinkVisualButton LinkVisualEthscan LinkVisualEthscam" target="_blank" href={"https://" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth?ensd=" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth"}>{(_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || ''}dfohub.eth</a></p>}
                    </AsyncValue>
                    <h5 className="DFOHostingTitle DFOHostingTitleB">External Domains</h5>
                    <a href={window.formatLink(_this.props.element.externalDNS)} target="_blank" className="LinkVisualButton LinkVisualEthscan">DNS Link</a>
                    <a href={window.formatLink(_this.props.element.externalENS)} target="_blank" className="LinkVisualButton LinkVisualEthscan">ENS Link</a>
                </section>
            </li>
        </ul>);
    }
});