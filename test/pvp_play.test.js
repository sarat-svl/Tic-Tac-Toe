const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require ('truffle-assertions');
let accounts;
let tictactoe;

Tie = async (p1, p2) => {
  await tictactoe.next_move(4, {from : accounts[p1]});
  await tictactoe.next_move(5, {from : accounts[p2]});
  await tictactoe.next_move(3, {from : accounts[p1]});
  await tictactoe.next_move(0, {from : accounts[p2]});
  await tictactoe.next_move(2, {from : accounts[p1]});
  await tictactoe.next_move(6, {from : accounts[p2]});
  await tictactoe.next_move(7, {from : accounts[p1]});
  await tictactoe.next_move(1, {from : accounts[p2]});
  await tictactoe.next_move(8, {from : accounts[p1]});
}

Win = async(p1, p2) => {
  await tictactoe.next_move(0, {from : accounts[p1]});
  await tictactoe.next_move(3, {from : accounts[p2]});
  await tictactoe.next_move(1, {from : accounts[p1]});
  await tictactoe.next_move(6, {from : accounts[p2]});
  await tictactoe.next_move(2, {from : accounts[p1]});
}

Getpoints = async(id) => {
  return (await tictactoe.get_points.call(id)).toNumber();
}

contract ('PVP Play', () => {
    beforeEach(async () => {
        // get the accounts
        accounts = await web3.eth.getAccounts();
        tictactoe = await TicTacToe.new();
        await tictactoe.join_game("sam",1, {from: accounts[1], value : web3.utils.toWei("1") });
        await tictactoe.join_game("John",1,  {from: accounts[2], value : web3.utils.toWei("1") });
    });

    it('On tie condition, points should remain same', async () => {
      //simulating tie condition
      let ini_p_1 = (await tictactoe.get_points.call(1)).toNumber();
      let ini_p_2 = (await tictactoe.get_points.call(2)).toNumber();
      await Tie(1, 2);
      let fin_p_1 = (await tictactoe.get_points.call(1)).toNumber();
      let fin_p_2 = (await tictactoe.get_points.call(2)).toNumber();
      assert(fin_p_1 == ini_p_1, "No change in points at tie match");
      assert(fin_p_2 == ini_p_2, "No change in points at tie match");
    });

    it('On Win condtion, Points should be changed', async () => {
      //simulating tie condition
      let ini_p_1 = (await tictactoe.get_points.call(1)).toNumber();
      let ini_p_2 = (await tictactoe.get_points.call(2)).toNumber();
      await Win(1, 2);
      let fin_p_1 = (await tictactoe.get_points.call(1)).toNumber();
      let fin_p_2 = (await tictactoe.get_points.call(2)).toNumber();
      assert(fin_p_1 == ini_p_1 + 1, "Winner of match should get point");
      assert(fin_p_2 == ini_p_2, "No change in points for lost match");
    });

    it('Winner should get amount', async () => {
      let p1_init_balance = await web3.eth.getBalance(accounts[1]);
      let p2_init_balance = await web3.eth.getBalance(accounts[2]);
      await Tie(1, 2);
    //   console.log(await Getpoints(1), await Getpoints(2));
      await Win(2, 1);
    //   console.log(await Getpoints(1), await Getpoints(2));
      await Tie(1, 2);
    //   console.log(await Getpoints(1), await Getpoints(2));
      await Win(2, 1);
    //   console.log(await Getpoints(1), await Getpoints(2));
      let p1_final_balance = await web3.eth.getBalance(accounts[1]);
      let p2_final_balance = await web3.eth.getBalance(accounts[2]);
    //   console.log(p1_final_balance, p1_init_balance, p2_final_balance, p2_init_balance);
      assert(p2_final_balance - p2_init_balance > 0, "Amount should be transfered to winner");
    });



    it('On tie condition money shoud be sent to owner', async () => {
      let owner_init_balance = await web3.eth.getBalance(accounts[0]);
      //console.log(owner_init_balance);
      await Tie(1, 2);
      await Tie(2, 1);
      await Win(1, 2);
      await Win(2, 1);
      let owner_final_balance = await web3.eth.getBalance(accounts[0]);
      //console.log(owner_final_balance);
      assert(owner_final_balance - owner_init_balance > 0, "Amount should be transfered to winner");
    });

});
