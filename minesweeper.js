$(function(){
  let squares = {};
  let numMines = 15;
  let tileCount = 10;
  let gameStatus = 'ready';

  const randomNum = (max) => {
    return Math.floor(Math.random() * max);
  }

  const getMineLocations = () => {
    // this function will return an array of random mine locations
    let mines = [];
    while (mines.length < numMines) {
      // randomly choose a location for a mine and make sure it doesn't already have a mine
      let next = randomNum(tileCount * tileCount);
      if (!mines.includes(next)) {
        mines.push(next);
      }
    }
    return mines;
  }

  const getMineCount = (mines, idx, row, col) => {
    // this function checks the surrounding tiles for mines and returns the count
    let count = 0;
    const boardSize = tileCount * tileCount;
    if (idx - 1 >= 0 && col > 0 && mines.includes(idx - 1)) { count += 1; } // count tile to left
    if (idx - tileCount - 1 >= 0 && col > 0 && mines.includes(idx - tileCount - 1)) { count += 1; } // count tile to upper left
    if (idx - tileCount >= 0 && mines.includes(idx - tileCount)) { count += 1; } // count tile above
    if (idx - tileCount + 1 >= 0 && col < tileCount - 1 && mines.includes(idx - tileCount + 1)) { count += 1; } // count tile to upper right
    if (idx + 1 < boardSize && col < tileCount - 1 && mines.includes(idx + 1)) { count += 1; } // count tile to right
    if (idx + tileCount - 1 < boardSize && col > 0 && mines.includes(idx + tileCount - 1)) { count += 1; } // count tile to lower left
    if (idx + tileCount < boardSize && mines.includes(idx + tileCount)) { count += 1; } // count tile below
    if (idx + tileCount + 1 < boardSize && col < tileCount - 1 && mines.includes(idx + tileCount + 1)) { count += 1; } // count tile to lower right
    return count;
  }

  let resetBoard = () => {
    // this function clears the game board and resets the squares object
    // the squares object holds an entry for each tile index and status of that tile
    $("#gameBoard").empty(); // remove all children from gameBoard
    const mines = getMineLocations();
    tileCount = $("#tileCount").val();
    console.log(tileCount);
    for (i = 0; i < tileCount; i++) {
      $("#gameBoard").append(`<span id="boardGameRow_${i}" class="boardGameRow"/></br>`);
      for (j = 0; j < tileCount; j++) {
        let idx = (i * tileCount) + j;
        let mineHere = mines.includes(idx);
        let mineCount = mineHere ? null : getMineCount(mines, idx, i, j);
        squares[idx] = {
          status: 'covered', // status of the tile => covered, marked, exposed
          mine: mineHere, // true if mine is located here
          mineCount: mineCount
        };
      }
    }
  }

  let renderBoard = () => {
    for (let i = 0; i < tileCount; i++) {
      // using let here is important to ensure the correct values of i and j are used
      // this is due to closure (let declares the variable to the scope of the loop instead of globally)
      // when the function is executed the values used are the last values for those variables
      for (let j = 0; j < tileCount; j++) {
        let idx = (i * tileCount) + j;
        $(`#boardGameRow_${i}`).append(`<div class="boardSquare greenSquare" id="boardGameCol_${i}-${j}"><p id="tile_${idx}" class="squareText hidden">0</p></div>`);
        $(`#boardGameCol_${i}-${j}`).click(function(){
        // each tile's text is represented by a p element with id = tile_${idx} and is initially hidden
        // this is so the div does not adjust when appending text later.  So, start with an empty placeholder so nothing
        // shifts in the DOM when updating this text
          switch(squares[idx].status) {
            case 'covered':
              // clicking on this without a marker in play will result in an exposed tile
              if (squares[idx].mine) {
                // blow up; game over
                gameStatus = 'over';
                $(this).addClass('bombSquare');
                $(this).removeClass('greenSquare');
              } else {
                // expose tile and display mine count nearby if available
                $(this).addClass('emptySquare');
                $(this).removeClass('greenSquare');
                if (squares[idx].mineCount > 0) {
                  $(`#tile_${idx}`).text(squares[idx].mineCount);
                  $(`#tile_${idx}`).removeClass('hidden');
                }
              }
              squares[idx].status = 'exposed';
              break;
            case 'marked':
              break;
          }
        });
      }
    }
  }

  $("#gameStart").click(function(){
    resetBoard();
    renderBoard();
  });

});
