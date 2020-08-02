var DFOElement = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
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
        var voice = this.controller.getVoiceOrOrganizationFirstVoice(this.state.sections[section]);
        var _this = this;
        ReactModuleLoader.load({
            modules: voice.modules,
            scripts: voice.scripts,
            callback: () => _this.setState({ section: voice.element, props: props || null, builtMenu: _this.controller.buildMenu(voice) }, function() {
                _this.forceUpdate();
            })
        });
    },
    componentDidMount() {
        this.controller.loadMenu();
    },
    render() {
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        props.props && Object.entries(props.props).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        return (<section className="DFOOpened">
            {props.builtMenu && props.builtMenu.map((menu, i) => <ul key={JSON.stringify(menu)} className={"DFONavigator DFONavigatorAfter" + (i == 0 ? "" : " DFOSubNavigator")}>
                {menu.map(it => <li key={it.name}>
                    <a href="javascript:;" onClick={_this.onClick} className={it.selected ? 'selected' : ''}>{it.name}</a>
                </li>)}
            </ul>)}
            {props.section && React.createElement(window[props.section], props)}
            {!props.section && <LoaderMinimino />}
        </section>);
    }
});