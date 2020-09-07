var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    getData() {
        return this.dFOMetadata.getData().then(metadata => { return {metadata}; });
    },
    render() {
        return (<section>
            <p><span>2 of 4 | Metadata</span><br></br>What this brand new DFO is about?</p>
            <DFOMetadataEdit ref={ref => this.dFOMetadata = ref}/>
        </section>);
    }
});