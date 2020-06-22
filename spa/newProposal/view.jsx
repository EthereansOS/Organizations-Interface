var NewProposal = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    getDefaultSubscriptions() {
        return {
            'smartContract/compilation': this.onCompilation,
            'smartContract/compiling': this.onCompiling,
            'comment/changed': (comment, type) => this[type.toLowerCase()].value = comment.trim(),
        }
    },
    onCompiling() {
        $(this.compileButton).addClass('disabled');
        $(this.publishButton).addClass('disabled');
    },
    compile(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        !$(e.currentTarget).hasClass('disabled') && (this.editor.functionalityAddressValue = this.functionalityAddress && this.functionalityAddress.value);
        !$(e.currentTarget).hasClass('disabled') && this.editor.tryCompile();
    },
    onType(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var target = e.target;
        var type = target.dataset.type;
        var _this = this;
        var typeTimeoutKey = 'onTypeTimeout_' + type;
        _this[typeTimeoutKey] && clearTimeout(_this[typeTimeoutKey]);
        _this[typeTimeoutKey] = setTimeout(function () {
            _this.editor.commentChanged(target.value.trim(), type);
        }, 900);
    },
    onCompilation(contracts) {
        $(this.compileButton).removeClass('disabled');
        try {
            if (JSON.stringify(this.contracts.name ? [this.contracts.abi] : Object.keys(this.contracts).map(key => this.contracts[key].abi)) === JSON.stringify(contracts.name ? [contracts.abi] : Object.keys(contracts).map(key => contracts[key].abi))) {
                return;
            }
        } catch (e) {
        }
        delete this.selectedContract;
        delete this.contractConstructor;
        this.contracts = contracts;
        var currentContract = this.functionalityContracts.value;
        this.functionalityContracts.innerHTML = '';
        if (!this.contracts) {
            this.functionalityContractMethods.innerHTML = '';
            this.onMethod();
            return;
        }
        $(this.publishButton).removeClass('disabled');
        if (contracts.name) {
            this.functionalityContracts.innerHTML = '<option value="' + contracts.name + '">' + contracts.name + '</option>';
        } else {
            this.functionalityContracts.innerHTML = Object.keys(contracts).map(it => contracts[it].bytecode !== '0x' && '<option value="' + it + '">' + it + '</option>').join('');
        }
        currentContract && contracts[currentContract] && (this.functionalityContracts.value = currentContract);
        this.onContract();
        this.onMethod();
    },
    onContract(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var _this = this;
        delete _this.contractConstructor;
        if (this.functionalityContracts.innerHTML === '') {
            return;
        }
        var currentMethod = parseInt(this.functionalityContractMethods.value);
        var currentMethodName = '';
        try {
            currentMethodName = this.functionalityContractMethods.children[currentMethod].innerHTML;
        } catch (e) {
        }
        this.functionalityContractMethods.innerHTML = '';
        this.selectedContract = this.contracts.name ? this.contracts : this.contracts[this.functionalityContracts.value];
        if (!this.selectedContract) {
            return;
        }
        var abi = this.selectedContract.abi;
        this.functionalityContractMethods.innerHTML = abi.map((it, i) => {
            var selected = false;
            try {
                selected = i === currentMethod && it.name === currentMethodName;
            } catch (e) {
            }
            if(it.name === 'onStart' || it.name === 'onStop') {
                if(it.type === 'constructor' || it.stateMutability === 'view' || it.stateMutability === 'pure') {
                    return;
                }
                if(it.name === 'onStart' && it.inputs.length === 2 && it.inputs[0].type === 'address' && it.inputs[1].type === 'address') {
                    return;
                }
                if(it.name === 'onStop' && it.inputs.length === 1 && it.inputs[0].type === 'address') {
                    return;
                }
            }
            var name = (it.type === 'function' ? ((it.name + '(') + (it.inputs.map(it => it.type).join(',').trim()) + ')') : '').split(' ').join('').split(',)').join(')');
            var args = (it.type !== 'function' ? '[]' : JSON.stringify(it.outputs.map(it => it.type))).split(' ').join('');
            it.type === 'constructor' && (_this.contractConstructor = it);
            return it.type !== 'function' ? '' : "<option value='" + i + '_' + name + '_' + args + "'" + (selected ? ' selected' : '') + '>' + name + '</option>';
        }).join('');
        if(!this.functionalityContractMethods.innerHTML) {
            delete this.selectedContract;
            delete this.contractConstructor;
        }
        this.onMethod();
        this.contracts.name && delete this.contractConstructor;
        this.forceUpdate();
    },
    onMethod(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        this.submitable.checked = false;
        this.internal.checked = false;
        this.needsSender.checked = false;
        this.internal.disabled = true;
        this.needsSender.disabled = true;
        if (this.functionalityContractMethods.innerHTML === '') {
            return;
        }
        var methodSignatureName = this.functionalityContractMethods.value.split('_')[1];
        this.internal.disabled = methodSignatureName === 'callOneTime(address)';
        var funct = (this.contracts.name ? this.contracts : this.contracts[this.functionalityContracts.value]).abi[this.functionalityContractMethods.value.split('_')[0]];
        this.submitable.checked = funct.stateMutability !== 'view' && funct.stateMutability !== 'pure';
        if (this.submitable.checked && funct.inputs.length >= 2) {
            this.needsSender.disabled = funct.inputs[0].type !== 'address' || funct.inputs[1].type !== 'uint256';
        }
        if (!this.submitable.checked && funct.inputs.length >= 1) {
            this.needsSender.disabled = funct.inputs[0].type !== 'address';
        }
    },
    publish(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        if($(this.publishButton).hasClass('disabled')) {
            return;
        }
        try {
            this.controller.publish();
        } catch(e) {
            this.emit('message', e.message || e, 'error')
        }
    },
    componentDidMount() {
        var _this = this;
        _this.onReplace();
        window.loadFunctionalities(_this.props.element, undefined, true);
        try {
            blockchainCall(_this.props.element.functionalitiesManager.methods.functionalityNames).then(JSON.parse).then(functionalityNames => _this.props.element.functionalityNames = functionalityNames).then(() => _this.forceUpdate()).catch(e => {});
        } catch(e) {
        }
    },
    onReplace(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var replaces = this.functionalityReplace.value;
        var label = $(this.updateDescriptionLabel).hide();
        var input = $(this.update).hide();
        replaces && label.show() && input.show();
        try {
            !replaces && this.editor.commentChanged(this.update.value = '', 'Update');
        } catch (e) {
        }
    },
    getFunctionality() {
        try {
            for (var i in this.props.element.functionalities) {
                var functionality = this.props.element.functionalities[i];
                if (functionality.codeName === this.props.codeName) {
                    return functionality;
                }
            }
        } catch (e) {
        }
    },
    onEditor(ref) {
        var _this = this;
        this.editor = ref;
        if (!this.editor || this.props.delete) {
            return;
        }
        try {
            var functionality = this.getFunctionality();
            functionality && this.enqueue(() => this.editor.loadContent(functionality.sourceLocationId, functionality.sourceLocation));
        } catch (e) {
        }
        if(_this.props.oneTimeProposal) {
            window.SolidityUtilities.getCompilers()
                .then(c => Object.keys(c.releases)[0])
                .then(r => {
                    var array = JSON.parse(JSON.stringify(window.context.voidOneTimeProposal));
                    array.unshift("");
                    array.unshift("pragma solidity ^" + r + ";");
                    _this.enqueue(() => _this.editor.editor.setValue(array.join('\n')), 300);
                });
        }
    },
    render() {
        var _this = this;
        var functionality = this.getFunctionality();
        return (
            <section className="NewProposalIndex">
                <section className="AllertBanner">
                    <p>If you're deploying a new perpetual functionality, be sure to add both onStart(address,address) and onStop(address) into the Smart Contract.</p>
                </section>
                <section className="SideViewCode">
                    <Editor ref={this.onEditor} className="NewProposalCode" readonly={this.props.delete || this.props.oneTimeCode} sourceLocation={this.props.sourceLocation} sourceLocationId={this.props.sourceLocationId} firstCode={this.props.oneTimeCode} compileAtStart={this.props.oneTimeCode !== undefined && this.props.oneTimeCode !== null}/>
                </section>
                <section className="DFOItOptions">
                    <p>Name</p>
                    <input className="ProposeTitle" id="functionalityName" type="text" ref={ref => ref && (ref.disabled = (functionality || this.props.delete || this.props.oneTimeCode || this.props.oneTimeProposal) ? true : false) && (ref.value = ((!this.props.delete && functionality && functionality.codeName) || ''))} />
                    <p>Discussion Link</p>
                    <input className="ProposeLink" id="functionalityLink" data-type='Discussion' type="text" ref={ref => this.discussion = ref} onChange={this.onType}/>
                    <p>Function Description</p>
                    <textarea id="functionalityDescription" data-type='Description' ref={ref => (this.description = ref) && (ref.disabled = this.props.oneTimeCode !== undefined && this.props.oneTimeCode !== null)} onChange={this.onType}/>
                    <p ref={ref => this.updateDescriptionLabel = ref}>Update Description</p>
                    <textarea id="functionalityDescriptionUpdate" data-type='Update' ref={ref => this.update = ref} onChange={this.onType} />
                    <select id="contractName" ref={ref => this.functionalityContracts = ref} onChange={this.onContract} />
                    <select id="functionalityMethodSignature" ref={ref => this.functionalityContractMethods = ref} onChange={this.onMethod} />
                    <label htmlFor="functionalitySubmitable">Submitable</label>
                    <input id="functionalitySubmitable" type="checkbox" ref={ref => this.submitable = ref} disabled />
                    <label htmlFor="functionalityInternal">Internal</label>
                    <input id="functionalityInternal" type="checkbox" ref={ref => this.internal = ref} disabled />
                    <label htmlFor="functionalityNeedsSender">Needs Sender</label>
                    <input id="functionalityNeedsSender" type="checkbox" ref={ref => this.needsSender = ref} disabled />
                    <label htmlFor="replacesCheck">Function replacing</label>
                    <input id="replacesCheck" type="checkbox" ref={ref => ref && (ref.checked = ref.disabled = (functionality || this.props.delete || this.props.oneTimeCode || this.props.oneTimeProposal) ? true : false) && (ref.checked = this.props.oneTimeProposal ? false : ref.checked)} onChange={e => {this.functionalityReplace.value = ""; this.functionalityReplace.disabled = !e.currentTarget.checked; e.currentTarget.checked ? $(this.functionalityReplace).show() : $(this.functionalityReplace).hide()}}/>
                    <select id="functionalityReplace" onChange={this.onReplace} ref={ref => {this.functionalityReplace = ref; ref && (ref.value = (functionality && functionality.codeName || '')); ref && functionality && functionality.codeName ? $(ref).show() : $(ref).hide()}} disabled>
                        <option value="">Replacing Functionality</option>
                        {this.props.element.functionalityNames && this.props.element.functionalityNames.map(it => <option key={it} value={it}>{it}</option>)}
                    </select>
                    {this.contractConstructor && this.contractConstructor.inputs.length > 0 && <div>
                        <p>Constructor arguments</p>
                        <ul ref={ref => this.constructorArguments = $(ref)}>
                            {this.contractConstructor.inputs.map(it => <li key={it.name}>
                                {(it.type === 'bytes32' || it.type === 'address' || it.type === 'string' || it.type.indexOf('uint') == 0) && <input type={it.type.indexOf('uint') == 0 ? "number" : "text"} min="0" placeholder={it.name}></input>}
                                {it.type === 'bool' && <select>
                                    <option value="false" selected>false</option>
                                    <option value="true">true</option>
                                </select>}
                            </li>)}
                        </ul>
                    </div>}
                    <div>
                        <a ref={ref => this.compileButton = ref} className={"LinkVisualButton" + (this.props.delete ? " disabled" : "")} href="javascript:;" onClick={this.compile}>Compile</a>
                        <WalletEnablerButton inactiveClassName="LinkVisualButtonPre" className={this.props.delete ? "" : "disabled"} onClick={this.publish} ref={ref => this.publishButton = (ref && ref.domRoot[0]) || undefined}>Publish</WalletEnablerButton>
                    </div>
                    <h4>Advanced</h4>
                    <label htmlFor="emergency">Emergency</label>
                    <input id="emergency" type="checkbox" onChange={() => $(this.publishButton).toggleClass('emergency')}/>
                    <label htmlFor="deployed">Deployed Contract?</label>
                    <input id="deployed" type="checkbox" ref={ref => this.deployedCheckbox = ref} onChange={() => {this.deployed.toggle(); this.editor && (this.editor.functionalityAddressValue = ""); this.functionalityAddress && (this.functionalityAddress.value = "")}}/>
                    <section ref={ref => (this.deployed = $(ref)) && ref && (!this.deployedCheckbox || !this.deployedCheckbox.checked) && this.deployed.hide()}>
                        <input id="functionalityAddress" placeholder="Smart Contract Address" type="text" ref={ref => this.functionalityAddress = ref} onChange={() => {this.onCompilation(); this.editor.functionalityAddressValue = ""}} />
                        <a onClick={this.compile}>Load</a>
                    </section>
                </section>
            </section>
        );
    }
});