$(function(){
  let squares = {};
  let numMines = 15;
  let tileCount = 10;
  let gameStatus = 'ready';
  let tileRemaining = 100;

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
    const tiles = getSurroundingTiles(idx, row, col);
    let count = 0;
    tiles.forEach(tile => {
      if (mines.includes(tile)) { count += 1; }
    });
    return count;
  }

  let resetBoard = () => {
    // this function clears the game board and resets the squares object
    // the squares object holds an entry for each tile index and status of that tile
    $("#gameBoard").empty(); // remove all children from gameBoard
    gameStatus = 'ready';
    const mines = getMineLocations();
    tileCount = $("#tileCount").val();
    tileCount = parseInt(tileCount);
    tileRemaining = tileCount * tileCount;
    numMines = Math.floor(0.15 * tileRemaining);
    $("#gameMessage").removeClass("successText");
    $("#gameMessage").removeClass("failureText");
    $("#gameMessage").text(`Number of Mines: ${numMines}`);
    for (i = 0; i < tileCount; i++) {
      $("#gameBoard").append(`<span id="boardGameRow_${i}" class="inline"/></br>`);
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

  const getSurroundingTiles = (idx, row, col) => {
    let tiles = [];
    const boardSize = tileCount * tileCount;
    if (idx - 1 >= 0 && col > 0) { tiles.push(idx - 1); } // tile to the left
    if (idx - tileCount - 1 >= 0 && col > 0) { tiles.push(idx - tileCount - 1); } // tile to the upper left
    if (idx - tileCount >= 0) { tiles.push(idx - tileCount); } // tile above
    if (idx - tileCount + 1 >= 0 && col < tileCount - 1) { tiles.push(idx - tileCount + 1); } // tile to the upper right
    if (idx + 1 < boardSize && col < tileCount - 1) { tiles.push(idx + 1); } // tile to the right
    if (idx + tileCount - 1 < boardSize && col > 0) { tiles.push(idx + tileCount - 1); } // tile to the lower left
    if (idx + tileCount < boardSize) { tiles.push(idx + tileCount); } // tile below
    if (idx + tileCount + 1 < boardSize && col < tileCount - 1) { tiles.push(idx + tileCount + 1); } // tile to the lower right
    return tiles;
  }

  const exposeSurroundingTiles = (idx, row, col) => {
    let tiles = getSurroundingTiles(idx, row, col);
    let emptyTiles = [];
    tiles.forEach(tile => {
      if (exposeTile(tile)) { // expose tile and if it is empty add it to the emptyTiles array
        emptyTiles.push(tile);
      }
    });
    return emptyTiles;
  }

  const getAndExposeSurroundingTiles = (idx) => {
    // expose this tile and all of the other connecting empty tiles
    let stillGoing = true;
    let tiles = [idx];
    let exposed = [idx];
    let next = [];
    while (stillGoing) {
      tiles.forEach(tile => {
        let row = Math.floor(tile / tileCount);
        let col = tile % tileCount;
        let surrounding = exposeSurroundingTiles(tile, row, col);
        if (surrounding.length > 0) {
          surrounding.forEach(surTile => {
            if (!exposed.includes(surTile)) {
              exposed.push(surTile);
              if (squares[surTile].mineCount === 0) {
                // another empty tile
                next.push(surTile);
              }
            }
          });
        }
      });
      if (next.length > 0) {
        tiles = next;
        next = [];
      } else {
        stillGoing = false;
      }
    }
  }

  const exposeTile = (idx) => {
    let emptyTile = false;
    if (squares[idx].status === 'covered') {
      emptyTile = true;
      // expose tile and display mine count nearby if available
      $(`#boardGameCol_${idx}`).addClass('emptySquare');
      $(`#boardGameCol_${idx}`).removeClass('greenSquare');
      squares[idx].status = 'exposed';
      tileRemaining -= 1;
      if (squares[idx].mineCount > 0) {
        $(`#tile_${idx}`).text(squares[idx].mineCount);
        $(`#tile_${idx}`).removeClass('hidden');
        emptyTile = false;
      }
    }
    return emptyTile;
  }

  let renderBoard = () => {
    for (let i = 0; i < tileCount; i++) {
      // using let here is important to ensure the correct values of i and j are used
      // this is due to closure (let declares the variable to the scope of the loop instead of globally)
      // when the function is executed the values used are the last values for those variables
      for (let j = 0; j < tileCount; j++) {
        let idx = (i * tileCount) + j;
        $(`#boardGameRow_${i}`).append(`<div class="boardSquare greenSquare" id="boardGameCol_${idx}"><p id="tile_${idx}" class="inline hidden">0</p></div>`);
        $(`#boardGameCol_${idx}`).click(function(){
        // each tile's text is represented by a p element with id = tile_${idx} and is initially hidden
        // this is so the div does not adjust when appending text later.  So, start with an empty placeholder so nothing
        // shifts in the DOM when updating this text
          if (gameStatus === 'ready') {
            switch(squares[idx].status) {
              case 'covered':
                // clicking on this without a marker in play will result in an exposed tile
                if (squares[idx].mine) {
                  // blow up; game over
                  gameStatus = 'over';
                  $(this).addClass('bombSquare');
                  $(this).removeClass('greenSquare');
                  $('#gameMessage').addClass('failureText');
                  $('#gameMessage').text('Game Over - You Stepped on a Mine!');
                } else {
                  let emptyTile = exposeTile(idx);
                  if (emptyTile) {
                    getAndExposeSurroundingTiles(idx);
                  }
                  if (numMines === tileRemaining) {
                    // the tiles left covered equal the number of mines - game over
                    gameStatus = 'over';
                    $('#gameMessage').addClass('successText');
                    $('#gameMessage').text('Congratulations! You avoided all of the mines!');
                  }
                }
                break;
              case 'marked':
                break;
            }
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
