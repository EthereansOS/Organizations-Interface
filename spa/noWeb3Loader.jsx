var NoWeb3Loader = React.createClass({
    render() {
        return (<article className="NoWeb3" style={{"position": "fixed", "z-index" : "300000", "top" : "0", "width" : "100%", "height" : "100%", "background" : "white", "margin-top" : "0"}}>
            <h1><img src="assets/img/ghostload.gif" /></h1>
            <section className="DisclamerWeb3">
                <h2>DFOhub</h2>
            </section>
        </article>);
    }
});