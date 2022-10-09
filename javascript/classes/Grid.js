
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

         // largeTree: [
         //    "largeTree",
         //    "grass",
         // ],
      
         // grass: [
         //    "grass",
         //    "sand",
         // ],
      
         // sand: [
         //    "sand",
         //    "ocean",
         // ],
      
         // ocean: [
         //    "ocean",
         // ],
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
            
            const cell = new Cell(this.collums, this.rows, this.cellSize, isEuclidean, i, j);
            this.cellsList[cell.id] = cell;
         }
      }

      // Set cells neighborsList
      for(let i in this.cellsList) {
         let cell = this.cellsList[i];

         cell.initNeighborsList(this.cellsList);
         // this.randomGenerator(ctx, img, cell);

         switch(cell.id) {

            case "0-0": cell.tileIndex = 0; 
            break;
            case "0-1": cell.tileIndex = 0; 
            break;
            case "0-2": cell.tileIndex = 1; 
            break;
            case "0-3": cell.tileIndex = 1; 
            break;

            case "1-0": cell.tileIndex = 0; 
            break;
            case "1-1": cell.tileIndex = 1; 
            break;
            case "1-2": cell.tileIndex = 1; 
            break;
            case "1-3": cell.tileIndex = 2; 
            break;

            case "2-0": cell.tileIndex = 1; 
            break;
            case "2-1": cell.tileIndex = 1; 
            break;
            case "2-2": cell.tileIndex = 2; 
            break;
            case "2-3": cell.tileIndex = 2; 
            break;

            case "3-0": cell.tileIndex = 2; 
            break;
            case "3-1": cell.tileIndex = 2; 
            break;
            case "3-2": cell.tileIndex = 2; 
            break;
            case "3-3": cell.tileIndex = 3; 
            break;
         }

         cell.drawPicture(ctx, img);
      }

      // this.randomGenerator(ctx, img);
   }


   // Map Random Generetor
   randomGenerator(ctx, img) {
      
      {
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

      {
      // if(!cell.tileIndex) {
         
      //    // Set other tiles
      //    if(cell.id !== "0-0" && cell.tilesArray.length !== 0) {
            
      //       let randIndex = this.rand(cell.tilesArray.length);
      //       let tileType = cell.tilesArray[randIndex];
      //       cell.tileIndex = this.baseTilesTypes.indexOf(tileType);

      //       cell.drawPicture(ctx, img, this.baseTilesTypes);

      //       let nebList = cell.neighborsList;
            
      //       // Set Neighbors
      //       for(let i in nebList) {
      //          let neighbor = nebList[i];
               
      //          neighbor.tilesArray = cell.tilesArray;
      //       }
      //    }
         
      //    // Set first tile
      //    else if(cell.id === "0-0") {
      //       cell.tileIndex = this.rand(this.baseTilesTypes.length);
      //       let tileType = this.baseTilesTypes[cell.tileIndex];
      //       cell.tilesArray = this.tilesConnections[tileType];

      //       cell.drawPicture(ctx, img, this.baseTilesTypes);

      //       let nebList = cell.neighborsList;
            
      //       // Set Neighbors
      //       for(let i in nebList) {
      //          let neighbor = nebList[i];
               
      //          neighbor.tilesArray = cell.tilesArray;
      //       }
      //    }
      // }
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