var DeFi = React.createClass({
    requiredModules: [
        'spa/wallet'
    ],
    getInitialState() {
        return {
            element: 'Wallet'
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
        return (
            <section className="DFOOpened">
                <ul className="DFONavigator DFOSubNavigator DFONavigatorAfter">
                    <li><a href="javascript:;" onClick={this.onClick} className="selected">Wallet</a></li>
                    <li><a href="javascript:;" onClick={this.onClick}>Token</a></li>
                    <li><a href="javascript:;" onClick={this.onClick}>DeFi Offering</a></li>
                </ul>
                {React.createElement(window[this.state.element], this.props)}
            </section>
        );
    }
});