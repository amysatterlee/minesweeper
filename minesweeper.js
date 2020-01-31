$(function(){
  let squares = {};

  let resetBoard = () => {
    console.log('resetting board');
    $("#gameBoard").empty();
    for (i = 0; i < 10; i++) {
      $("#gameBoard").append(`<span id="boardGameRow_${i}"/></br>`);
      for (j = 0; j < 10; j++) {
        squares[(i * 10) + j] = 'unknown';
      }
    }
  }

  let renderBoard = () => {
    console.log('rendering board');
    for (let i = 0; i < 10; i++) {
      // using let here is important to ensure the correct values of i and j are used
      // this is due to closure (let declares the variable to the scope of the loop instead of globally)
      // when the function is executed the values used are the last values for those variables
      for (let j = 0; j < 10; j++) {
        $(`#boardGameRow_${i}`).append(`<div class="boardSquare blueSquare" id="boardGameCol_${i}-${j}"/>`);
        $(`#boardGameCol_${i}-${j}`).click(function(){
          console.log(`you clicked row ${i} column ${j}`);
          if (squares[(i * 10) + j] === 'red') {
            $(this).addClass("blueSquare");
            $(this).removeClass("redSquare");
            squares[(i * 10) + j] = 'blue';
          } else {
            $(this).addClass("redSquare");
            $(this).removeClass("blueSquare");
            squares[(i * 10) + j] = 'red';
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
