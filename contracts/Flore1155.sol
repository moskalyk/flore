import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "solidity-string-utils/StringUtils.sol";

library ECRecovery {

  /**
   * @dev Recover signer address from a message by using his signature
   * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
   * @param sig bytes signature, the signature is generated using web3.eth.sign()
   */
  function recover(bytes32 hash, bytes memory sig) public pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    //Check the signature length
    if (sig.length != 65) {
      return (address(0));
    }

    // Divide the signature in r, s and v variables
    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }

    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }

    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      return ecrecover(hash, v, r, s);
    }
  }

}

interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

library UIntToString {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}

contract Flore is ERC1155, Ownable {
    
    string private baseURI__;

    using Counters for Counters.Counter;
    Counters.Counter private tokenIdCounter;

    using ECDSA for bytes32;
    using ECRecovery for bytes32;

    address public feeContractAddress;
    address public prover;

    event Temperature(uint indexed celcius);
    mapping(uint256 => uint256) public idToPrice;

    constructor(address feeContractAddress_, address prover_, uint[] memory prices) ERC1155("https://bafybeic2ixdggsdj3wwl5xac7p2ix2oca3uoq25tzn5thznlpbhwgjzjta.ipfs.nftstorage.link/{id}.json") {
        for (uint256 i = 0; i < prices.length; i++) {
            idToPrice[i] = prices[i];
        }
        _mint(address(this), 0, 1010, "");
        tokenIdCounter.increment();
        _mint(address(this), 1, 999, "");
        tokenIdCounter.increment();
        _mint(address(this), 2, 888, "");
        tokenIdCounter.increment();
        _mint(address(this), 3, 777, "");
        tokenIdCounter.increment();
        _mint(address(this), 4, 666, "");
        tokenIdCounter.increment();
        _mint(address(this), 5, 555, "");
        tokenIdCounter.increment();
        _mint(address(this), 6, 444, "");
        tokenIdCounter.increment();
        _mint(address(this), 7, 333, "");
        tokenIdCounter.increment();
        _mint(address(this), 8, 222, "");
        tokenIdCounter.increment();
        _mint(address(this), 9, 111, "");
        tokenIdCounter.increment();
        feeContractAddress = feeContractAddress_;
        prover = prover_;
    }

    function arrangeFlower(address _address, uint price, uint tokenID, uint blockNumber, uint celcius, bytes memory weatherProof) public {
        require(blockNumber < (block.number + 50), "");
        bytes32 message = keccak256(abi.encodePacked(celcius, _address, tokenID, price, blockNumber));
        bytes32 preFixedMessage = message.toEthSignedMessageHash();
        require(prover == ECRecovery.recover(preFixedMessage, weatherProof), "Invalid Weather Proof");
        emit Temperature(celcius);
        uint flore = getMax(price, idToPrice[tokenID]);
        require(IERC20(feeContractAddress).transferFrom(msg.sender, address(this), flore), "TransferFrom");
        IERC1155(address(this)).safeTransferFrom(address(this), _address, tokenID, 1, "");
    }

    function getMax(uint256 a, uint256 b) public pure returns (uint256) {
        if (a > b) {
            return a;
        } else {
            return b;
        }
    }

    function tokenURI(uint tokenId) public view virtual returns (string memory) {
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, UIntToString.toString(tokenId), ".json")) : "";
    }

    function _baseURI() internal view virtual returns (string memory) {
        return baseURI__;
    }

    function setBaseURI(string memory baseURI_) onlyOwner public {
        baseURI__ = baseURI_;
    }

    function mintToFlore(uint tokenID, uint quantity, string memory baseURI_, uint price) onlyOwner public {
        setBaseURI(baseURI_);
       _mint(address(this), tokenID, quantity, "");
        idToPrice[tokenID] = price;
        tokenIdCounter.increment();
        baseURI__ = baseURI_;
    }

    function totalSupply() external view returns (uint256) {
        return tokenIdCounter.current();
    }
}