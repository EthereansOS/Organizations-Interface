var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    render() {
        var _this = this;
        if(false) {
            return <DFOMetadataEdit className="DeployNewWhat2"/>;
        }
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Organization Info</h2>
            </section>
            <li className="TheDappInfo05 TheDappInfo1B">
                <img className="DFObrandICON" src={_this.props.element.iconUri}></img>
            </li>
            {_this.props.element.shortDescription && <li className="TheDappInfo2">
                <h5 className="DFOHostingTitle">BIO</h5>
                <section className="DFOTitleSection">
                    <p className="DFOLabelTitleInfo">{_this.props.element.shortDescription}<a className="MOREINFOSOON">More</a></p>
                </section>
            </li>}
            <li className="TheDappInfo1 TheDappInfo1B">
                <h5 className="DFOHostingTitle">More</h5>
                <section className="DFOTitleSection DFOTitleSectionB">
                    <a href={_this.props.element.wpUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">Explainer</a>
                    <a href={_this.props.element.wpUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">Roadmap</a>
                    <a href={_this.props.element.repoUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">Ext. Repo</a>
                    <a href={_this.props.element.discussionUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">Discussion</a>
                    <h5 className="DFOHostingTitle DFOHostingTitleB">Secure Domain</h5>
                    <AsyncValue>
                        {_this.props.element.ens !== undefined && <p className="DFOLabelTitleInfo"><a className="LinkVisualButton LinkVisualEthscan LinkVisualEthscam" target="_blank" href={"https://" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth?ensd=" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth"}>{(_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || ''}dfohub.eth</a></p>}
                    </AsyncValue>
                    <h5 className="DFOHostingTitle DFOHostingTitleB">External Domains</h5>
                    <a href={_this.props.element.distributedLink} target="_blank" className="LinkVisualButton LinkVisualEthscan">DNS Link</a>
                    <a href={_this.props.element.distributedLink} target="_blank" className="LinkVisualButton LinkVisualEthscan">ENS Link</a>
                </section>
            </li>
        </ul>);
    }
});