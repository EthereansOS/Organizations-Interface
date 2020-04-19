var Messages = React.createClass({
    getDefaultSubscriptions() {
        return {
            'message' : this.onMessage
        };
    },
    onMessage(message, className) {
        this.setState({message, className});
    },
    clear(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        this.onMessage();
    },
    render() {
        return(
            <div className={"MainMsg" + (this.state && this.state.className ? (" MainMsg_" + this.state.className) : "")} style={{"display" : this.state && this.state.message ? "block" : "none"}}>
                {this.state && this.state.message && typeof this.state.message === 'string' && <p ref={ref => ref && (ref.innerHTML = this.state.message)}/>}
                {this.state && this.state.message && typeof this.state.message !== 'string' && this.state.message.message && <p ref={ref => ref && (ref.innerHTML = this.state.message.message)}/>}
                {this.state && this.state.message && typeof this.state.message !== 'string' && this.state.message.map && this.state.message.map((it) =><p key={it} ref={ref => ref && (ref.innerHTML = it)}/>)}
                <a href="javascript:;" onClick={this.clear}>Close</a>
            </div>
        );
    }
});