window.getNextContractAddress = function(address, nonce) {
    return '0x' + require('keccak')('keccak256').update(require('rlp').encode([address, window.web3.utils.toHex(nonce)])).digest('hex').substring(24);
}