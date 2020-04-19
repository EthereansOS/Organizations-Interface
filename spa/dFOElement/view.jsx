var DFOElement = React.createClass({
    requiredModules: [
        'spa/overview'
    ],
    getInitialState() {
        return {
            element: 'Overview'
        }
    },
    getDefaultSubscriptions() {
        return {
            'section/change': this.sectionChange
        };
    },
    onClick(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.sectionChange(e.target.innerHTML);
    },
    sectionChange(section, props) {
        this.domRoot.children().find('a').each((i, elem) => {
            ((elem = $(elem).removeClass('selected')).html() === section || (elem.data('alternatives') && elem.data('alternatives').indexOf(section) !== -1)) && elem.addClass('selected');
        });
        var element = section.split(' ').join('');
        var _this = this;
        ReactModuleLoader.load({
            modules: ['spa/' + element.firstLetterToLowerCase()],
            callback: () => _this.setState({ element, props: props || null })
        });
    },
    render() {
        var props = this.state.props || {};
        props.element = this.props.element;
        props.edit = this.state && this.state.edit;
        props.okBoomer = this.state && this.state.okBoomer;
        return (
            <section className="DFOOpened">
                <ul className="DFONavigator DFONavigatorAfter">
                    <li><a href="javascript:;" onClick={this.onClick} className="selected">Overview</a></li>
                    <li><a href="javascript:;" onClick={this.onClick}>Functions</a></li>
                    <li><a href="javascript:;" onClick={this.onClick}>State</a></li>
                    <li><a href="javascript:;" onClick={this.onClick} data-alternatives="New Proposal,One Time Proposal">Proposals</a></li>
                </ul>
                {React.createElement(window[this.state.element], props)}
            </section>
        );
    }
});