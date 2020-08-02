var Dapp = React.createClass({
    requiredModules: [
        'spa/functions'
    ],
    getInitialState() {
        return {
            section: 'Functions',
            voices : [
                'Functions',
                'State'
            ]
        }
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
            callback: () => _this.setState({ section: element, props: props || null })
        });
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        props.section = props.subSection || props.section;
        return (
            <section className="DFOOpened">
                <ul className="DFONavigator DFOSubNavigator DFONavigatorAfter">
                    {props.voices.map(it => <li key={it}>
                        <a href="javascript:;" onClick={this.onClick} className={props.section === it ? "selected" : ""}>{it}</a>
                    </li>)}
                </ul>
                {React.createElement(window[props.section], props)}
            </section>
        );
    }
});