var AsyncValue = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
    render() {
        if(!this.props.children) {
            return <LoaderMinimino/>;
        }
        try {
            var typeofChildren = (typeof this.props.children).toLowerCase();
            if(typeofChildren === 'number' || typeofChildren === 'string') {
                return (<span>{this.props.children}</span>);
            }
            if(this.props.children.props.children) {
                return this.props.children;
            }
            if(this.props.children.props.src) {
                return this.props.children;
            }
        } catch(e) {
            return <LoaderMinimino/>;
        }
        return <LoaderMinimino/>;
    }
});