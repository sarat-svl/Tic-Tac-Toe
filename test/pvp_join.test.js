const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require ('truffle-assertions');

let accounts;
let tictactoe;
let wallet;

contract ('player vs player join testt', () => {
    beforeEach(async () => {
        // get the accounts
        accounts = await web3.eth.getAccounts();
        tictactoe = await TicTacToe.new();
        owner = accounts[0];
    });

    it('1 vs 0', async () => {
    await tictactoe.join_game("sam", 1 , {from: accounts[1], value : web3.utils.toWei("1") });
    truffleAssert.reverts(tictactoe.join_game("Alex", 0, {
              from: accounts[2],
              value : web3.utils.toWei("1")
              }), "Max. number of players already reached!!");
    });

    it('Same player should not be allowed', async () => {
      await tictactoe.join_game("sam",1, {from: accounts[1], value : web3.utils.toWei("1")});
      truffleAssert.reverts(tictactoe.join_game("Alex", 1, {
         from: accounts[1],
         value : web3.utils.toWei("1")
       }), "Player has already registered!!");
    });

    it('Max 2 players are allowed', async () => {
      await tictactoe.join_game("sam",1, {from: accounts[1], value : web3.utils.toWei("1") });
      await tictactoe.join_game("John",1,  {from: accounts[2], value : web3.utils.toWei("1") });
      truffleAssert.reverts(tictactoe.join_game("Alex", 1, {
         from: accounts[3],
         value : web3.utils.toWei("1")
         }), "Max. number of players already reached!!");
     });
     
    it('Should increment player count after first player joining game', async () => {
      let expected_player_count = 0;
      await tictactoe.join_game("sam",1, {from: accounts[1], value : web3.utils.toWei("1") });
      let player_count_1 = (await tictactoe.num_players.call()).toNumber();
      assert.equal(player_count_1, expected_player_count+1, "It Should increase count");

      await tictactoe.join_game("John",1,  {from: accounts[2], value : web3.utils.toWei("1") });
      let player_count_2= (await tictactoe.num_players.call()).toNumber();
      assert.equal(player_count_2, expected_player_count+2, "It Should increase count");

     });
//
});
