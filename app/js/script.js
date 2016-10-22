

(function() {
	var startButton = document.getElementById('start');
	startButton.addEventListener('click', start);
	var stopButton = document.getElementById('stop');
	stopButton.addEventListener('click', stop);
	// adding the event for key press
	document.addEventListener('keydown', changeDirection);
	genMatrix();
})();

var play = true,
	DIR = { left: -1, down: 0, right: 1 }, // directions
	xAxis = { back: 1, default: 0 }, // values for verical movement
	intervalTime = 800, // the period of time for an interval function call

	block, // the current moving block
	movingBlock, // for the repositioning the block after a certain time interval

	// used to trace the block, (using indexes to identify the right position easier)
	startingRow = 1,
	startingColl = 6,
	currentRow = 1,
	currentColl = 6,
	lastRow = 1,
	lastColl = 6,
	nextRow = 2,
	nextColl = 6,

	lastX=6,
	lastY=1,

	startingPoz = document.getElementsByClassName('coll-' + startingColl)[0], // this is a column in the first row of the table
	lastPoz, // the last position of the moving block
	nextAvailableCell, // the next available cell for the moving block
	lastOccupiedCell, // the last occupied cell for the moving block
	// global vars
	maxRow = 14,
	maxColl = 10,
	minColl = 1,
	matrix = [],
	// colors for the blocks background
	colors = ['#be0000', '#becf00', '#2cbe00', '#001ebe', '#be009a']; // the colors of the moving block

function genMatrix(){
	var i,j;
	for (i = 1; i<= maxRow; i++){
		matrix[i] = [];
		for(j = 1; j<= maxColl; j++){
			matrix[i][j] = 0;
		}
	}
	console.log(matrix);
}

function start() {
	if(play) {
		if(matrix.length === 0){
			genMatrix();
		}
		block = generateBlock();
		movingBlock = setInterval(reposition, intervalTime);
	} else {
		alert("Game over!");
	}
}

function stop() {
	play = false;
}

function generateBlock() {
	blockGen = document.createElement('div');
	blockGen.className = 'active-block';
	blockGen.style.background = generateBackgroundColor();
	startingPoz.appendChild(blockGen);
	nextAvailableCell = getnextAvailableCell(DIR.down, xAxis.default);

	setThePositions(startingRow, startingColl, startingRow, startingColl);

	return blockGen;
}

/*
	the function starts when a key is pressed and it directs a particular event to a coresponding case
*/
function changeDirection(event) {
	event = event || window.event;
	//clearInterval(movingBlock);
	if(event.keyCode == '37') {
		// left arrow
		if(verifyVacancy(DIR.left, xAxis.back)) {
			try {
				moveTo(block, DIR.left, xAxis.back);
				setThePositions(currentRow, currentColl, nextRow, nextColl, nextRow+xAxis.back, nextColl+DIR.left);
			} catch(err) {
				console.log(err);
			}
			deleteLastPosition();
		}
	} else if(event.keyCode == '39') {
		// right arrow
		if(verifyVacancy(DIR.right, xAxis.back)) {
			try {
				moveTo(block, DIR.right, xAxis.back);
				setThePositions(currentRow, currentColl, nextRow, nextColl, nextRow+xAxis.back, nextColl+DIR.right);
			} catch(err) {
				console.log(err);
			}
			deleteLastPosition();
		}
	} else if(event.keyCode == '40') {
		// down arrow
		if(verifyVacancy(DIR.down, xAxis.default)) {
			try {
				moveTo(block, DIR.down, xAxis.default);
				setThePositions(currentRow, currentColl, nextRow, nextColl);
			} catch(err) {
				console.log(err);
			}
			deleteLastPosition();
		}
		event.preventDefault();
	}
	//movingBlock = setInterval(reposition, intervalTime);

}

function reposition() {
	/*
	  if there is an available position next the function will reposition the block,
	  otherwise it will clear the last position and create a new block from the beginning
	*/
	if(play) {
		if(verifyVacancy(DIR.down, xAxis.default)) {
			try {
				moveTo(block, DIR.down, xAxis.default);
				setThePositions(currentRow, currentColl, nextRow, nextColl);
			} catch(err) {
				console.log(err);
			}
			deleteLastPosition();
		} else {
			block.className = 'positioned-block';
			matrix[currentRow][currentColl] = 1;
			resetPositions();
			clearInterval(movingBlock);
			start();
		}
	} else {
		alert("Game over!");
		clearInterval(movingBlock);
		play = true;
	}
}

// verify if the next position in a certain direction is open
function verifyVacancy(direction, goBack) {
	if(currentRow < maxRow && currentColl + direction >= minColl && currentColl + direction <= maxColl) {
		if(isPositionOpen(direction, goBack)) {
			return true;
		}
	}
	return false;
}

// moves the element to a specified direction
// @block - the last elment genereted.
// @direction - specifies the direction of the block
// @goBack - specifies the number of rows rows to which a block is set back
function moveTo(currentBlock, direction, goBack) {
	if(typeof currentBlock === 'undefined' || currentBlock === null) {
		throw new Error("Block is not defined!");
	}
	if(typeof direction === 'undefined' || direction === null) {
		throw new Error("The direction isn't specified!");
	}
	if(typeof goback === 'undefined' || goBack === null) {
		goBack = 0;
	}
	var newBlock = document.createElement('div');
	newBlock.className = 'active-block';
	newBlock.style.background = block.style.background;

	// set a trace in the matrix
	matrix[currentRow][currentColl] = 2;
	lastX = currentRow;
	lastY = currentColl;
	nextAvailableCell = getnextAvailableCell(direction, goBack);
	//lastOccupiedCell = getnextAvailableCell(direction, goBack);

	nextAvailableCell.appendChild(newBlock);
}

// this function removes the first child element from a specified position of the table.
// used to delete the last position of the block.
function deleteLastPosition() {
	// var parent;
	//
	// parent = document.getElementsByClassName('coll-' + lastColl)[lastRow];
	// parent.removeChild(parent.children[0]);
	// lastOccupiedCell.removeChild(lastOccupiedCell.children[0]);
	console.log("x:"+lastX);
	console.log('y:'+lastY);
	var parent = document.getElementsByClassName('coll-' + lastX)[lastY];
	parent.removeChild(parent.children[0]);
}

// function checks if a targeted position is empty
// @direction - specifies the direction of the block
// @goBack - specifies if the block should go back one row
function isPositionOpen(direction, goBack) {
	// var targetedPosition = getnextAvailableCell(direction, goBack);
	// if(targetedPosition.children.length > 0) {
	// 	return false;
	// }
	// return true;
	console.log("pos:"+matrix[nextRow][nextColl]);
	if(matrix[nextRow][nextColl] === 0) {
		console.log("Position open:"+nextRow+", "+nextColl);
		return true;
	}
	console.log("Position occupied:"+nextRow+", "+nextColl);
	return false;
}

/* setting the global variables for the blocks position*/
function setThePositions(currentR, currentC, nextR, nextC, incrNextRow, incrNextColl) {
	if(currentR && currentC && currentR !== null && currentC !== null) {
		lastRow = currentR;
		lastColl = currentC;
	}
	if(nextR && nextC && nextR !== null && nextC !== null) {
		currentRow = nextR;
		currentColl = nextC;
	}
	if(incrNextRow && incrNextColl && incrNextRow !== null && incrNextColl !== null) {
		nextRow = incrNextRow;
		nextColl = incrNextColl;
	} else {
		nextRow = currentRow + 1;
		nextColl = currentColl;
	}
}

/*
  returns an td element which represents the next position
  @direction - specifies the direction of the block
  @goBack - specifies if the block should go back one row
*/
function getnextAvailableCell(direction, goBack) {
	if(typeof direction === 'undefined' || direction === null) {
		direction = 0;
	}
	if(typeof goback === 'undefined' || goBack === null) {
		goBack = 0;
	}
	return document.getElementsByClassName('coll-' + (nextColl + direction))[nextRow - goBack];
}


/*
  generate a index which will point to a specific position in an array with hex colors as strings
*/
function generateBackgroundColor() {
	var color, randNr = randomNumber(0, 4);
	color = colors[randNr];
	return color;
}

/* resets the positions to the initial values */
function resetPositions() {
	currentRow = startingRow;
	currentColl = startingColl;
	lastRow = startingRow;
	lastColl = startingColl;
	nextRow = startingRow + 1;
	nextColl = startingColl;
}

function randomNumber(minVal, maxVal) {
	return Math.round((Math.random() * (maxVal - minVal + 1) + minVal));
}
