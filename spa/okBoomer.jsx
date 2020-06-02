var OkBoomer = React.createClass({
    render() {
        if(!this.props.okBoomer){
        return(
            <span style={{"display":"none"}}></span>
        )}
        return(<p className="OkBoomer">
            {this.props.okBoomer && this.props.children}
        <div className="BoomerTriangle"></div>
        </p>);
    }
});