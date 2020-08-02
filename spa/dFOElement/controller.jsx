var DFOElementController = function (view) {
    var context = this;
    context.view = view;

    context.loadMenu = async function loadMenu() {
        var menu = await (await fetch('data/menuOrganization.json')).json();
        var sections = {};
        var firstSection;
        var iterate = function (voice, parent) {
            parent = (typeof parent).toLowerCase() === 'number' ? null : parent;
            firstSection = firstSection || !voice.organization && voice.name;
            sections[voice.name] = {
                parent,
                organization: voice.organization,
                name: voice.name,
                element: voice.element || voice.name.split(' ').join(''),
                scripts: voice.scripts,
                modules: voice.modules || ['spa/' + (voice.element || voice.name).split(' ').join('').firstLetterToLowerCase()]
            };
            voice.organization && voice.organization.forEach(it => iterate(it, voice));
        };
        menu.forEach(iterate);
        context.view.setState({ menu, sections }, function () {
            context.view.sectionChange(firstSection);
        });
    };

    context.buildMenu = function buildMenu(voice, builtMenu) {
        builtMenu = builtMenu || [];
        var parent = voice.parent || context.view.state.menu;
        builtMenu.unshift((parent.organization || parent).map(it => {
            return {
                name: it.name,
                selected: it.name === voice.name
            };
        }));
        return parent.organization ? context.buildMenu(parent, builtMenu) : builtMenu;
    };

    context.getVoiceOrOrganizationFirstVoice = function getVoiceOrOrganizationFirstVoice(voice) {
        if (!voice.organization) {
            return voice;
        }
        return context.getVoiceOrOrganizationFirstVoice(context.view.state.sections[voice.organization[0].name]);
    };
};