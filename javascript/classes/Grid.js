
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
            "grass",
         ],
      
         grass: [
            "largeTree",
            "sand",
         ],
      
         sand: [
            "grass",
            "ocean",
         ],
      
         ocean: [
            "sand",
         ],
      };
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
         this.randomGenerator(cell);
         cell.drawPicture(ctx, img);
      }
   }


   // Map Random Generetor
   randomGenerator(cell) {

      if(!cell.tileIndex && cell.tilesArray.length === 0) {

         // Set cell tile type
         cell.tileIndex = this.rand(this.baseTilesTypes.length);
         let cellTileType = this.baseTilesTypes[cell.tileIndex];


         // ********************************
         // if(cell.tileIndex === 0 || cell.tileIndex === 3) cell.isBlocked = true;
         // ********************************

         
         // Set cell tile array
         cell.tilesArray = this.tilesConnections[cellTileType];
         if(!cell.tilesArray.includes(cellTileType)) cell.tilesArray.push(cellTileType);

         // Set manhattan neighbors tile array
         this.setNebTileArray(cell.manhattanNeb, cell, cellTileType);
         
         // Set euclidean neighbors tile array
         this.setNebTileArray(cell.euclideanNeb, cell, cellTileType);
      }

      else {
         let cellTileType = this.baseTilesTypes[cell.tileIndex];

         // Set manhattan neighbors tile array
         this.setNebTileArray(cell.manhattanNeb, cell, cellTileType);
         
         // Set euclidean neighbors tile array
         this.setNebTileArray(cell.euclideanNeb, cell, cellTileType);
      }
   }

   setNebTileArray(neighborArray, cell, cellTileType) {

      neighborArray.forEach(nebName => {
         let neighbor = cell.neighborsList[nebName];
         
         if(neighbor && neighbor.tilesArray.length === 0) {
            
            neighbor.tilesArray = this.tilesConnections[cellTileType];
            if(!neighbor.tilesArray.includes(cellTileType)) neighbor.tilesArray.push(cellTileType);

            let randIndex =  this.rand(neighbor.tilesArray.length);
            let nebTileType = neighbor.tilesArray[randIndex];
            neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);


            // ********************************
            // if(neighbor.tileIndex === 0 || neighbor.tileIndex === 3) neighbor.isBlocked = true;
            // ********************************
         }
      });
   }

}