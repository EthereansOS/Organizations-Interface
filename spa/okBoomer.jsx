var OkBoomer = React.createClass({
    render() {
        return(<p className="OkBoomer">
            {this.props.okBoomer && this.props.children}
            <div className="BoomerTriangle"></div>
        </p>);
    }
});