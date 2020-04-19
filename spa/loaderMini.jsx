var LoaderMini = React.createClass({
    render() {
        return (<div className="LoaderChainPull">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                {this.props.message && <h5>{this.props.message}</h5>}
            </div>);
    }
});