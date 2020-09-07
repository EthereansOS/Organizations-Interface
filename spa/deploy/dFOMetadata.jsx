var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    getData() {
        return this.dFOMetadataEdit.getData().then(metadata => { return {metadata}; });
    },
    setData(data) {
        var _this = this;
        data && setTimeout(() => _this.dFOMetadataEdit.setData(data.metadata), 250);
    },
    render() {
        return (<section>
            <p><span>2 of 4 | Metadata</span><br></br>What this brand new DFO is about?</p>
            <DFOMetadataEdit ref={ref => this.dFOMetadataEdit = ref}/>
        </section>);
    }
});