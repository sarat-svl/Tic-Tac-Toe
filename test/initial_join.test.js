const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require ('truffle-assertions');

let accounts;
let tictactoe;
let wallet;

contract ('Initial join', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        tictactoe = await TicTacToe.new();
        owner = accounts[0];
    });

    it('Input option for joining game is either 0 or 1', async () => {
      truffleAssert.reverts(tictactoe.join_game("sam", 2, {
            from: accounts[1],
            value : web3.utils.toWei("1")
        }), "Enter 0 for playing vs agent or 1 for playing vs player");
    });

    it('Contract is deployed', async() => {
        const tictactoeowner = await tictactoe.owner.call();
        assert(owner == tictactoeowner, "The wallet is the one who launches the smart contract.");
    });

    it('Should have 0 players initially', async () => {
      let expected_initial_count = 0;
      let initial_count = (await tictactoe.num_players.call()).toNumber();
      assert.equal(initial_count, expected_initial_count, "Inital number of players should be 0");
    });


});
