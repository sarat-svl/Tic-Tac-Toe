const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require ('truffle-assertions');

let accounts;
let tictactoe;

contract ('player vs agent join test', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        tictactoe = await TicTacToe.new();
        owner = accounts[0];
    });

    it('0 vs 0', async () => {
        await tictactoe.join_game("sam", 0 , {from: accounts[1], value : web3.utils.toWei("1") });
        truffleAssert.reverts(tictactoe.join_game("Alex", 0, {
                  from: accounts[2],
                  value : web3.utils.toWei("1")
                  }), "Max. number of players already reached!!");
        });

    it('0 vs 1', async () => {
      await tictactoe.join_game("sam", 0 , {from: accounts[1], value : web3.utils.toWei("1") });
      truffleAssert.reverts(tictactoe.join_game("Alex", 1, {
                from: accounts[2],
                value : web3.utils.toWei("1")
                }), "Max. number of players already reached!!");
      });

    it('Should increment player count after first player joining game', async () => {
    await tictactoe.join_game("sam",0, {from: accounts[1], value : web3.utils.toWei("1") });
    let player_count_1 = (await tictactoe.num_players.call()).toNumber();
    assert.equal(player_count_1, 1, "It Should increase count");
    });

    it('Should decrement the max players value', async () => {
    let expected_player_count = (await tictactoe.MAX_PLAYERS.call()).toNumber();
    await tictactoe.join_game("sam",0, {from: accounts[1], value : web3.utils.toWei("1") });
    let present_expected_player_count = (await tictactoe.MAX_PLAYERS.call()).toNumber();
    assert.equal(present_expected_player_count, expected_player_count-1, "Max player value should be decrementd")
    });

    it('Player id should be one', async () => {
    let expected_id = 1
    await tictactoe.join_game("sam",0, {from: accounts[1], value : web3.utils.toWei("1") });
    let actual_id = (await tictactoe.get_id.call({from : accounts[1]})).toNumber();
    assert.equal(actual_id, expected_id, "Id of player should be one")

    });


});
