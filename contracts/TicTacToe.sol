pragma solidity >=0.4.22 <0.6.0;

contract TicTacToe
{
    address payable public owner;
    address payable winner;
    uint8 private curr_player_id;
    int8[9] private board;
    uint8 public MAX_PLAYERS = 2;
    uint8 public MAX_MATCHES = 4;
    uint8 public MAX_MOVES = 9;
    uint public ENTRY_FEE = 1 ether;
    uint8 public AGENT_ID = 0;
    uint8 public PLAYER1_ID = 1;
    uint8 public PLAYER2_ID = 2;
    uint8 public num_players = 0;
    uint8 public num_moves = 0;
    bool public match_over = true;
    uint8 public match_num = 0;
    uint8 vs_player = 1;

    struct Player {
        string name;
        address payable _address;
        uint8 points;
    }

    Player[3] players;

    mapping(address => uint8) public player_id;
    mapping(address => uint256) private player_balance;

    constructor() public {
        // Set owner to creator of contract
        owner = msg.sender;

        // Agent's id is 0
        players[AGENT_ID] = Player("Agent", owner, 0);

        init_board();
    }

    uint8[][] win_conditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                                [0, 4, 8], [2, 4, 6]];

    function init_board() internal {
        for (uint i = 0; i < board.length; ++i) {
            board[i] = -1;
        }
    }

    function get_board() public view returns(int8[9] memory) {
        return board;
    }

    function get_points(uint8 index) public view returns (uint8){
        require(AGENT_ID <= index && index <= MAX_PLAYERS, "Index out of range");
        return players[index].points;
    }

    function get_id() public view returns (uint8) {
        return player_id[msg.sender];
    }

    function join_game(string memory _name, uint8 _vs_player) public payable {
        require (msg.value == ENTRY_FEE, "Invalid entry fee!!");
        require (_vs_player < 2, "Enter 0 for playing vs agent or 1 for playing vs player");
        require (player_id[msg.sender] == 0, "Player has already registered!!");
        if (_vs_player == 0) {
            /* require(num_players < 1, "A player has already registered!!"); */
            MAX_PLAYERS = 1;
        }
        require(num_players < MAX_PLAYERS, "Max. number of players already reached!!");
        vs_player = _vs_player;
        num_players = num_players + 1;
        uint8 id = num_players;
        players[id] = Player(_name, msg.sender, 0);
        player_id[msg.sender] = id;
        if(num_players == MAX_PLAYERS) {
            reset_match();
        }
    }

    function check_board_state() private view returns(int8){
        for(uint8 i = 0; i < win_conditions.length; ++i) {
            uint8[] memory temp = win_conditions[i];
            if(board[temp[0]] != -1 && board[temp[0]] == board[temp[1]] && board[temp[0]] == board[temp[2]]) {
                return (int8)(board[temp[0]]);
            }
        }
        return -1;
    }

    function get_other_player_id (uint8 p1_id) internal view returns (uint8) {
        if (vs_player == 1)
            return (~p1_id) % 3;   // toggle between 1 and 2
        else
            return (~p1_id) % 2;   // toggle between 0 and 1
    }

    function get_random_position() internal view returns (uint8) {
        uint256 rand_pos = uint256(keccak256(abi.encodePacked(now))) % (MAX_MOVES - num_moves);
        uint256 p = 0;
        for (uint pos = 0; pos < board.length; ++pos) {
            if (board[pos] == -1) {
                if (rand_pos == p)
                    return (uint8)(pos);
                ++p;
            }
        }
        return MAX_MOVES;   // Invalid index
    }

    function reset_match() private {
        require(match_over == true, "The previous match is not over yet!!");
        init_board();
        num_moves = 0;
        match_over = false;         // New match started
        curr_player_id = match_num % 2;
        if (vs_player == 1) {
            ++curr_player_id;
        } else if (curr_player_id == AGENT_ID) {
            uint8 pos = get_random_position();
            next_move(pos);
        }
    }

    function end_game() private {
        players[0].points = 0;
        for(uint8 i = 1; i <= num_players; i++)
        {
            delete player_id[players[i]._address];
            delete players[i];
        }
        num_players = 0;
    }

    function return_winner_id() private view returns(int8){
        uint8 p1_id = curr_player_id;
        uint8 p2_id = 0;
        if (vs_player == 1) {
            p2_id = (~p1_id) % 3;   // toggle between 1 and 2
        } else {
            p2_id = (~p1_id) % 2;   // toggle between 0 and 1
        }
        if(players[p1_id].points > players[p2_id].points)
            return (int8)(p1_id);
        if(players[p2_id].points > players[p1_id].points)
            return (int8)(p2_id);
        return -1;
    }

    function declare_winner() internal returns(string memory) {
        int8 winner_id = return_winner_id();
        if(winner_id == -1)
        {
            if (vs_player == 0)
              owner.transfer(ENTRY_FEE);
            else
              owner.transfer(2*ENTRY_FEE);
            return "Its Tie Overall";
        }
        else
        {
          if(winner_id == 0)
              owner.transfer(ENTRY_FEE);
          else
          {
            winner = players[(uint8)(winner_id)]._address;
            winner.transfer(2*ENTRY_FEE);
            return "Prize money transfered to the winner!!";
          }
        }
    }

    function next_move(uint8 _position) public returns(string memory){
        require(match_num < MAX_MATCHES, "Max. number of matches reached!!");
        require(num_players == MAX_PLAYERS, "Required number of players not registered yet!!");
        require(num_moves < MAX_MOVES, "Max. number of moves reached!!");
        if (curr_player_id != AGENT_ID)
            require(player_id[msg.sender] == curr_player_id, "Not your move!!");
        require(0 <= _position && _position <= 8, "Invalid move!!");
        require(board[_position] == -1, "Board position already filled!!");

        num_moves += 1;
        board[_position] = (int8)(curr_player_id);
        int8 match_winner_id = check_board_state();
        if (match_winner_id >= 0 || num_moves == MAX_MOVES) {
            match_over = true;
            match_num += 1;
            if (match_winner_id >= 0)
                players[(uint8)(match_winner_id)].points += 1;
            if(match_num == MAX_MATCHES) {
              string memory result = declare_winner();
              end_game();
              return result;
            }
            reset_match();
            return "Next Match about to begin";
        }
        curr_player_id = get_other_player_id(curr_player_id);

        // Playing vs agent
        if (curr_player_id == AGENT_ID) {
            uint8 pos = get_random_position();
            next_move(pos);
        }
    }
}
