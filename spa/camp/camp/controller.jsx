var CampController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        window.campContract = window.newContract(window.context.CampABI, window.getNetworkElement("campAddress"));
        window.wethToken = await window.loadTokenInfos(window.wethAddress);
    };
};