var GlobalCatcher = React.createClass({
    render() {
        return (<div><div style={{"text-align":"center","width":"100%","margin-top":"150px"}}><span style={{"display":"inline-block","font-size":"250px"}}>&#128561;</span></div><div style={{"color": "white","width":"100%","text-align":"center"}}>An error occurred{!this.props.error ? '' : (': "' + (this.props.error.message || this.props.error)) + '"'}. Please <a href="javascript:;" onClick={() => window.location.reload()}>refresh</a> the page.</div></div>);
    }
});