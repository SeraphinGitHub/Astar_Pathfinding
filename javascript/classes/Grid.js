
"use strict"

// =====================================================================
// Grid Class
// =====================================================================
class Grid {
   constructor(width, height, cellSize) {

      this.cellsList = {};
      
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      
      this.collums = (width -(width %cellSize)) /cellSize;
      this.rows = (height -(height %cellSize)) /cellSize;

      // Real tiles arrays
      {
      /*
      this.baseTilesTypes = [

         "largeTree",
         "mediumTree",
         "smallTree",
         "grass",
         "dryGround",
         "sand",
         "ocean",
      ];
      
      this.tilesConnections = {
      
         largeTree: [
            "mediumTree",
         ],
      
         mediumTree: [
            "largeTree",
            "smallTree",
         ],
      
         smallTree: [
            "mediumTree",
            "grass",
         ],
      
         grass: [
            "smallTree",
            "dryGround",
            "sand",
         ],
      
         dryGround: [
            "grass",
            "sand",
         ],
      
         sand: [
            "grass",
            "dryGround",
            "ocean",
         ],
      
         ocean: [
            "sand",
         ],
      };
      */
      }


      // TESTS tiles arrays
      this.baseTilesTypes = [

         "largeTree",
         "grass",
         "sand",
         "ocean",
      ];

      this.tilesConnections = {

         largeTree: [
            "largeTree",
            "grass",
         ],
      
         grass: [
            "largeTree",
            "grass",
            "sand",
         ],
      
         sand: [
            "grass",
            "sand",
            "ocean",
         ],
      
         ocean: [
            "sand",
            "ocean",
         ],
      };

      this.tilesOpenList = [];
      this.tilesClosedList = [];
   }

   rand(maxValue) {
      return Math.floor(Math.random() *maxValue);
   }

   init(isEuclidean, ctx, img) {

      // Init grid
      for(let i = 0; i < this.collums; i++) {
         for(let j = 0; j < this.rows; j++) {
            
            const cell = new Cell(this.collums, this.rows, this.cellSize, isEuclidean, i, j);
            this.cellsList[cell.id] = cell;
         }
      }

      // Set cells neighborsList
      for(let i in this.cellsList) {
         let cell = this.cellsList[i];

         cell.initNeighborsList(this.cellsList);
      }
      
      this.randomGenerator(ctx, img);
   }


   // Map Random Generetor
   randomGenerator(ctx, img) {

      let count = 0;

      // Set start cell
      let cellsListID = Object.keys(this.cellsList);
      let randIndex = this.rand(cellsListID.length);
      let randID = cellsListID[randIndex];
      let startTile = this.cellsList[randID];


      // Set tile type
      startTile.tileIndex = this.rand(this.baseTilesTypes.length);
      let cellTileType = this.baseTilesTypes[startTile.tileIndex];
      startTile.tilesArray = this.tilesConnections[cellTileType];
      startTile.drawPicture(ctx, img, this.baseTilesTypes, count);

      this.tilesOpenList.push(startTile);

      while(this.tilesOpenList.length > 0) {

         let cell = this.tilesOpenList[this.tilesOpenList.length -1];
         let nebList = cell.neighborsList;         

         for(let i in nebList) {
            let neighbor = nebList[i];
            
            if(!this.tilesClosedList.includes(neighbor)) {
               if(!neighbor.tileIndex && !this.tilesOpenList.includes(neighbor)) {
   
                  count++;
                  let randIndex =  this.rand(cell.tilesArray.length);
                  let tileType = cell.tilesArray[randIndex];
                  // let neighborNebList = neighbor.neighborsList;
   
                  // for(let i in neighborNebList) {
                  //    let neighborsNeb = neighborNebList[i];
                     
                  //    if(!neighborsNeb.tileIndex || neighborsNeb.tilesArray.includes(tileType)) {
   
                        neighbor.tileIndex = this.baseTilesTypes.indexOf(tileType);
                        neighbor.tilesArray = this.tilesConnections[tileType];
                        neighbor.drawPicture(ctx, img, this.baseTilesTypes, count);
                        
                        // if(!this.tilesOpenList.includes(neighbor)) this.tilesOpenList.push(neighbor);
         
                  //    }
                  // }
   
                  this.tilesOpenList.push(neighbor);
               }
            }
         }

         this.tilesOpenList.splice(this.tilesOpenList.length -1, 1);
         this.tilesClosedList.push(cell);
      }

      // console.log(this.tilesClosedList); // ******************************************************
   }

   setNebTileArray(neighborArray, cell, count, ctx, img) {

      neighborArray.forEach(nebName => {
         let neighbor = cell.neighborsList[nebName];
         
         if(neighbor && !neighbor.tileIndex && neighbor.tilesArray.length === 0) {
            
            count++;

            let randIndex =  this.rand(cell.tilesArray.length);
            let nebTileType = cell.tilesArray[randIndex];
            neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
            
            neighbor.tilesArray = this.tilesConnections[nebTileType];
            if(!neighbor.tilesArray.includes(nebTileType)) neighbor.tilesArray.push(nebTileType);

            neighbor.drawPicture(ctx, img, this.baseTilesTypes, count);
         }
      });
   }

}