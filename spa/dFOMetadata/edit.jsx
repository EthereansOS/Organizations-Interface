var DFOMetadataEdit = React.createClass({
    getData() {
        return window.validateDFOMetadata(window.getData(this.domRoot), true);
    },
    render() {
        return (<section className="DeployNewWhat">
            <div className="InsertDfoName">
                <label htmlFor="name">Name:</label>
                <input autocomplete="off" id="name" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="shortDescription">Short Description:</label>
                <textarea id="shortDescription" type="text"></textarea>
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="wpUri">White Paper:</label>
                <input id="wpUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="brandUri">Brand:</label>
                <input id="brandUri" type="file" accepts="image/*" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="logoUri">Token Logo:</label>
                <input id="logoUri" type="file" accepts="image/*" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="decentralizedIndex">Decentralized Index:</label>
                <input id="decentralizedIndex" type="number" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="distributedLink">Distributed Link:</label>
                <input id="distributedLink" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="discussionUri">Discussion Link:</label>
                <input id="discussionUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="repoUri">Repo Link:</label>
                <input id="repoUri" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="externalDNS">External Homepage:</label>
                <input id="externalDNS" type="text" />
            </div>
            <div className="InsertDfoSubdomain">
                <label htmlFor="externalENS">Alternative ENS:</label>
                <input id="externalENS" type="text" />
            </div>
        </section>);
    }
});