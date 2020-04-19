var Loader = React.createClass({
    requiredScripts: [
        'spa/sequentialOps.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'loader/toggle': this.onToggle
        };
    },
    onToggle(visible, sequentialOps, initialContext) {
        this.setState({sequentialOps, initialContext, visible: (visible === true || visible === false) ? visible : this.state && this.state.visible ? !this.state.visible : true });
    },
    render() {
        return (
            <div className="MainLoader" style={{ "display": this.state && this.state.visible ? "block" : "none" }}>
                <article className="MainLoaderAll">
                    {this.state && this.state.sequentialOps && <SequentialOps auto="true" start="true" showCancelButton="true" initialContext={this.state.initialContext}>
                        {this.state.sequentialOps}
                    </SequentialOps>}
                </article>
            </div>
        );
    }
});