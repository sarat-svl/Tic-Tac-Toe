const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require ('truffle-assertions');

let accounts;
let tictactoe;

contract ('Inital play test', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        tictactoe = await TicTacToe.new();
    });

//one player should not play game on player vs player
it('Overriding filled position', async () => {
  await tictactoe.join_game("sam", 1 , {from: accounts[1], value : web3.utils.toWei("1") });
  await tictactoe.join_game("John", 1 , {from: accounts[2], value :web3.utils.toWei("1")});
  await tictactoe.next_move(1, {from : accounts[1]});
  truffleAssert.reverts(tictactoe.next_move(1, {from : accounts[2]}), "Board position already filled!!");
});

it('Invalid move checking', async () => {
  await tictactoe.join_game("sam", 1 , {from: accounts[1], value : web3.utils.toWei("1") });
  await tictactoe.join_game("John", 1 , {from: accounts[2], value : web3.utils.toWei("1") });
  truffleAssert.reverts(tictactoe.next_move(10, {from : accounts[1]}), "Invalid move!!");
});

it('One player should not able to play game', async () => {
  await tictactoe.join_game("sam", 1 , {from: accounts[1], value : web3.utils.toWei("1") });
  truffleAssert.reverts(tictactoe.next_move(1), "Required number of players not registered yet!!");
});


    it('Initial conditions for playing game', async () => {
      await tictactoe.join_game("sam", 1 , {from: accounts[1], value : web3.utils.toWei("1") });
      await tictactoe.join_game("John", 1 , {from: accounts[2], value : web3.utils.toWei("1") });
      expected_num_moves = 0;
      act_num_moves = (await tictactoe.num_moves.call()).toNumber();
      expected_match_num = 0;
      act_match_num = (await tictactoe.match_num.call()).toNumber();
      expected_match_over = false;
      act_match_over = (await tictactoe.match_over.call());
      assert(expected_num_moves == act_num_moves, "Initial moves should be 0");
      assert(expected_match_num == act_match_num, "Initial match number should be 0");
      assert(expected_match_over == act_match_over, "After players joined game, match should be played");
    });







});
