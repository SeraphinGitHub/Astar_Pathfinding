
"use strict"

// =====================================================================
// Grid Class
// =====================================================================
class GridClass {
   constructor(width, height, cellSize) {

      this.cellsList = {};
      
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      
      this.collums = (width -(width %cellSize)) /cellSize;
      this.rows = (height -(height %cellSize)) /cellSize;

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

      this.openTilesList = [];
      this.closedTilesList = [];
   }

   rand(maxValue) {
      return Math.floor(Math.random() *maxValue);
   }

   init(isEuclidean, ctx, img) {

      // Init grid
      for(let i = 0; i < this.collums; i++) {
         for(let j = 0; j < this.rows; j++) {
            
            const cell = new CellClass(this.collums, this.rows, this.cellSize, isEuclidean, i, j);
            this.cellsList[cell.id] = cell;
         }
      }

      // Set cells neighborsList
      for(let i in this.cellsList) {
         let cell = this.cellsList[i];

         cell.initNeighborsList(this.cellsList);
      }
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

      this.openTilesList.push(startTile);

      while(this.openTilesList.length > 0) {

         let cell = this.openTilesList[0];
         let nebList = cell.neighborsList;
         
         // Scan cell neighbors
         for(let i in nebList) {
            let neighbor = nebList[i];
            
            if(!this.closedTilesList.includes(neighbor)) {
               if(!this.tileIndex && !this.openTilesList.includes(neighbor)) {
                  
                  if(neighbor.tilesArray.length === 0) {

                     count++;
                     let randIndex =  this.rand(cell.tilesArray.length);
                     let tileType = cell.tilesArray[randIndex];

                     neighbor.tileIndex = this.baseTilesTypes.indexOf(tileType);
                     neighbor.tilesArray = this.tilesConnections[tileType];
                     neighbor.drawPicture(ctx, img, this.baseTilesTypes, count);
   
                     this.openTilesList.push(neighbor);
                  }
               }
            }
         }
         
         this.openTilesList.splice(0, 1);
         this.closedTilesList.push(cell);
      }
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