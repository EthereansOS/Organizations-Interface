var DFOMetadata = React.createClass({
    requiredScripts: [
        'spa/dFOMetadata/edit.jsx'
    ],
    getData() {
        return this.dFOMetadata.getData()
    },
    render() {
        return (<section>
            <p><span>2 of 4 | Metadata</span><br></br>Insert all your DFO's info.</p>
            <DFOMetadataEdit ref={ref => this.dFOMetadata = ref}/>
        </section>);
    }
});