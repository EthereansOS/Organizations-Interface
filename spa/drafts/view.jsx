var Drafts = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    render() {
        return (
            <section className="DraftsIndex">
                <section className="DraftsActiveIndex">
                    <h4>Active Drafts</h4>
                    <ul>
                        <li>
                            <section className="DraftBio">
                                <h5>Add New | <span>DAI Ceck Information</span></h5>
                                <p>Deploy, BUIDL and Govern Decentralized Flexible Organizations, for a new Censorship-Resilient wave of Unstoppable dapps. DFOs are based on a new Microservices Style Developing, upgradable by voting, without needs to fork it. Basically, without points of failure and an entity to trust</p>
                            </section>
                            <section className="DraftAction">
                                <a href="javascript:;" className="LinkVisualButton DraftActionTransaction">Deprecate</a>
                                <a href="javascript:;" className="LinkVisualButton DraftActionTransaction">Update</a>
                                <a href="javascript:;" className="LinkVisualButton DraftActionTransaction">Propose</a>
                            </section>
                            <section className="DraftAction">
                                <a className="LinkVisualButton" href="javascript:;">Discussion</a>
                                <a className="LinkVisualButton" href="javascript:;">Code</a>
                            </section>
                        </li>
                    </ul>
                </section>
                <section className="DraftsOldIndex">
                    <h4>Deprecated Drafts</h4>
                    <ul>
                        <li>
                            <section className="DraftBio">
                                <h5>Add New | <span>DAI Ceck Information</span></h5>
                                <p>Deploy, BUIDL and Govern Decentralized Flexible Organizations, for a new Censorship-Resilient wave of Unstoppable dapps. DFOs are based on a new Microservices Style Developing, upgradable by voting, without needs to fork it. Basically, without points of failure and an entity to trust</p>
                            </section>
                            <section className="DraftAction">
                                <p>Deprecated Block:<br></br>43865295</p>
                                <a className="LinkVisualButton" href="javascript:;">Code</a>
                            </section>
                        </li>
                    </ul>
                </section>
            </section>
        );
    }
});