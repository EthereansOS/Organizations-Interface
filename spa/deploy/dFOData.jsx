var DFOData = React.createClass({
    getData() {
        var _this = this;
        return (new Promise(function (ok, ko) {
            var data = window.getData(_this.domRoot);
            var errors = [];
            !data.dfoName && errors.push('Insert a valid DFO Name');
            !data.ensDomain && errors.push('ENS Domain is mandatory');
            if (errors.length > 0) {
                return ko(errors);
            }
            return ok(data);
        })).then(_this.checkENS);
    },
    checkENS(e) {
        var _this = this;
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = e.target;
        var ens = (target ? target.value : e.ensDomain).toLowerCase();
        e.ensDomain && (e.ensDomain = ens);
        var call = function () {
            return new Promise(async function (ok, ko) {
                var exists = false;
                try {
                    exists = await window.blockchainCall(window.ENSController.methods.recordExists, nameHash.hash(nameHash.normalize(ens + ".dfohub.eth")));
                } catch(exception) {
                }
                if (_this.ensCheck) {
                    target && (target.value = ens);
                    _this.ensCheck.innerHTML = "&#" + (exists ? "9940" : "9989") + ";"
                    if (!e.preventDefault && exists) {
                        return ko(['ENS Name already taken']);
                    }
                }
                return ok(e);
            });
        };
        if (!target) {
            return call();
        }
        this.checkTimeout && window.clearTimeout(this.checkTimeout);
        this.checkTimeout = window.setTimeout(call, 700);
    },
    render() {
        return (<section>
            <p><span>1 of 3 | Bio</span><br></br>Fist of all, choose the DFO name and redeem your ENS subdomain. The .dfohub.eth subdomain is an essential feature for new DFOs, in fact, the subdomain will redirect users to the DFO's index persistently as long as the ethereum network exists.</p>
            <section className="DeployNewWhat">
                <div className="InsertDfoName">
                    <label htmlFor="dfoName">Name:</label>
                    <input autocomplete="off" id="dfoName" type="text" />
                </div>
                <div className="InsertDfoSubdomain">
                    <label htmlFor="ensDomain">Subdomain:</label>
                    <input id="ensDomain" type="text" onChange={this.checkENS} /> <span>.dfohub.eth</span> <span className="SubDomainFree" ref={ref => this.ensCheck = ref}></span>
                </div>
            </section>
        </section>);
    }
});