let cols = 5; //columns in the grid
let rows = 5; //rows in the grid

let grid = new Array(cols); //array of all the grid points

let openList = []; //array containing unevaluated grid points
let closedList = []; //array containing completely evaluated grid points

let start; //starting grid point
let end; // ending grid point (goal)
let path = [];

//heuristic we will be using - Manhattan distance
//for other heuristics visit - https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.hCosttml
function heuristic(position0, position1) {
  let d1 = Math.abs(position1.x - position0.x);
  let d2 = Math.abs(position1.y - position0.y);

  return d1 + d2;
}

//constructor function to create all the grid points as objects containind the data for the points
function GridPoint(x, y) {
  this.x = x; //x location of the grid point
  this.y = y; //y location of the grid point
  this.fCost = 0; //total cost function
  this.gCost = 0; //cost function from start to the current grid point
  this.hCost = 0; //heuristic estimated cost function from current grid point to the goal
  this.neighbors = []; // neighbors of the current grid point
  this.parent = undefined; // immediate source of the current grid point

  // update neighbors array for a given grid point
  this.updateNeighbors = function (grid) {
    let i = this.x;
    let j = this.y;
    if (i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
  };
}

//initializing the grid
function init() {
  //making a 2D array
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new GridPoint(i, j);
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].updateNeighbors(grid);
    }
  }

  start = grid[0][0];
  end = grid[cols - 1][rows - 1];

  openList.push(start);

  console.log(grid);
}

//A star search implementation

function search() {
  init();

  while (openList.length > 0) {

    //assumption lowest index is the first one to begin with
    let lowestIndex = 0;

    for (let i = 0; i < openList.length; i++) {
      if (openList[i].fCost < openList[lowestIndex].fCost) {
        lowestIndex = i;
      }
    }

    let current = openList[lowestIndex];

    if (current === end) {

      let temp = current;
      path.push(temp);

      while (temp.parent) {
        path.push(temp.parent);
        temp = temp.parent;
      }

      console.log("DONE!");

      // return the traced path
      return path.reverse();
    }

    //remove current from openList
    openList.splice(lowestIndex, 1);

    //add current to closedList
    closedList.push(current);

    let neighbors = current.neighbors; // Array;

    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      if (!closedList.includes(neighbor)) {
        let possibleG = current.gCost + 1;

        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
        }

        else if (possibleG >= neighbor.gCost) {
          continue;
        }

        neighbor.gCost = possibleG;
        neighbor.hCost = heuristic(neighbor, end);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.parent = current;
      }
    }
  }

  //no solution by default
  return [];
}

console.log(search());