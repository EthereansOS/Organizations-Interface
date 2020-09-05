var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    render() {
        var _this = this;
        if(false) {
            return <DFOMetadataEdit/>;
        }
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Metadata</h2>
            </section>
            {_this.props.element.shortDescription && <li className="TheDappInfo1">
                <h5 className="DFOHostingTitle">&#128462; Description</h5>
                <section className="DFOTitleSection">
                    <p className="DFOLabelTitleInfo">{_this.props.element.shortDescription}</p>
                </section>
            </li>}
            <li className="TheDappInfo1">
                <h5 className="DFOHostingTitle">&#57354; Useful Links</h5>
                <section className="DFOTitleSection">
                    <a href={_this.props.element.wpUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; White Paper</a>
                    <a href={_this.props.element.distributedLink} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; Link</a>
                    <a href={_this.props.element.discussionUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; Discussion</a>
                    <a href={_this.props.element.repoUri} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; Repo</a>
                </section>
            </li>
        </ul>);
    }
});