pragma solidity ^0.4.17;

contract Message {
    string public message;
    address public manager;

    function Message(string initMsg) public {
        message = initMsg;
        manager = msg.sender;
    }

    function setMessage(string newMsg) public {
        message = newMsg;
    }

    function setRestrictedMsg(string newMsg) public managerRestricted {
        message = newMsg;
    }

    modifier managerRestricted {
        if(msg.sender == manager) _;
    }
}