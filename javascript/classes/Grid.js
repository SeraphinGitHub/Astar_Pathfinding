
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
      }
      
      this.randomGenerator(ctx, img);
   }


   // Map Random Generetor
   randomGenerator(ctx, img) {

      // let aze = 0;

      // if(!cell.tileIndex && cell.tilesArray.length === 0) {

      //    // Set cell tile type
      //    cell.tileIndex = this.rand(this.baseTilesTypes.length);
      //    let cellTileType = this.baseTilesTypes[cell.tileIndex];


      //    // ********************************
      //    // if(cell.tileIndex === 0 || cell.tileIndex === 3) cell.isBlocked = true;
      //    // ********************************

         
      //    // Set cell tile array
      //    cell.tilesArray = this.tilesConnections[cellTileType];
      //    if(!cell.tilesArray.includes(cellTileType)) cell.tilesArray.push(cellTileType);

      //    // Set manhattan neighbors tile array
      //    this.setNebTileArray(cell.manhattanNeb, cell, cellTileType);
         
      //    // Set euclidean neighbors tile array
      //    this.setNebTileArray(cell.euclideanNeb, cell, cellTileType);
         
      // }

      // cell.drawPicture(ctx, img, this.baseTilesTypes, aze);


      let cellsIDArray = Object.keys(this.cellsList);
      let randIndex = this.rand(cellsIDArray.length);
      let randID = cellsIDArray[randIndex];
      let startTile = this.cellsList[randID];


      // Set cell tile type
      startTile.tileIndex = this.rand(this.baseTilesTypes.length);
      let cellTileType = this.baseTilesTypes[startTile.tileIndex];
      
      // Set cell tile array
      startTile.tilesArray = this.tilesConnections[cellTileType];
      if(!startTile.tilesArray.includes(cellTileType)) startTile.tilesArray.push(cellTileType);

      
      let aze = 0;
      startTile.drawPicture(ctx, img, this.baseTilesTypes, aze);


      // for(let i in startTile.neighborsList) {
      //    let neighbor = startTile.neighborsList[i];

      //    if(neighbor && !neighbor.tileIndex && neighbor.tilesArray.length === 0) {

      //       aze++;
            
      //       let randIndex =  this.rand(startTile.tilesArray.length);
      //       let nebTileType = startTile.tilesArray[randIndex];
      //       neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
            
      //       neighbor.tilesArray = this.tilesConnections[nebTileType];
      //       if(!neighbor.tilesArray.includes(nebTileType)) neighbor.tilesArray.push(nebTileType);
            
      //       neighbor.drawPicture(ctx, img, this.baseTilesTypes, aze);
      //    }
      // }

      // for(let i in startTile.neighborsList) {
      //    let neighbor = startTile.neighborsList[i];

      //    for(let i in neighbor.neighborsList) {
      //       let neighbor_2 = neighbor.neighborsList[i];
   
      //       if(neighbor_2 && !neighbor_2.tileIndex && neighbor_2.tilesArray.length === 0) {
   
      //          aze++;
               
      //          let randIndex =  this.rand(neighbor.tilesArray.length);
      //          let nebTileType = neighbor.tilesArray[randIndex];
      //          neighbor_2.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
               
      //          neighbor_2.tilesArray = this.tilesConnections[nebTileType];
      //          if(!neighbor_2.tilesArray.includes(nebTileType)) neighbor_2.tilesArray.push(nebTileType);
               
      //          neighbor_2.drawPicture(ctx, img, this.baseTilesTypes, aze);
      //       }
      //    }
      // }




      
      startTile.manhattanNeb.forEach(nebName => {
         let neighbor = startTile.neighborsList[nebName];
         
         if(neighbor && !neighbor.tileIndex && neighbor.tilesArray.length === 0) {

            aze++;
            
            let randIndex =  this.rand(startTile.tilesArray.length);
            let nebTileType = startTile.tilesArray[randIndex];
            neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
            
            neighbor.tilesArray = this.tilesConnections[nebTileType];
            if(!neighbor.tilesArray.includes(nebTileType)) neighbor.tilesArray.push(nebTileType);
            
            neighbor.drawPicture(ctx, img, this.baseTilesTypes, aze);
         }

      });

      // startTile.euclideanNeb.forEach(nebName => {
      //    let neighbor = startTile.neighborsList[nebName];
         
      //    if(neighbor && !neighbor.tileIndex && neighbor.tilesArray.length === 0) {

      //       aze++;
            
      //       let randIndex =  this.rand(startTile.tilesArray.length);
      //       let nebTileType = startTile.tilesArray[randIndex];
      //       neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
            
      //       neighbor.tilesArray = this.tilesConnections[nebTileType];
      //       if(!neighbor.tilesArray.includes(nebTileType)) neighbor.tilesArray.push(nebTileType);
            
      //       neighbor.drawPicture(ctx, img, this.baseTilesTypes, aze);
      //    }

      // });







      startTile.manhattanNeb.forEach(nebName => {
         let neighbor = startTile.neighborsList[nebName];
         
         neighbor.manhattanNeb.forEach(nebName => {
            let neighbor_2 = neighbor.neighborsList[nebName];
            
            if(neighbor_2 && !neighbor_2.tileIndex && neighbor_2.tilesArray.length === 0) {
   
               aze++;
   
               let randIndex =  this.rand(neighbor.tilesArray.length);
               let nebTileType = neighbor.tilesArray[randIndex];
               neighbor_2.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
               
               neighbor_2.tilesArray = this.tilesConnections[nebTileType];
               if(!neighbor_2.tilesArray.includes(nebTileType)) neighbor_2.tilesArray.push(nebTileType);
               
               neighbor_2.drawPicture(ctx, img, this.baseTilesTypes, aze);
            }
   
         });
      });
      




      // this.setNebTileArray(cell.manhattanNeb, cell, cellTileType);
      // this.setNebTileArray(cell.euclideanNeb, cell, cellTileType);
      
   }

   setNebTileArray(neighborArray, cell, cellTileType) {

      neighborArray.forEach(nebName => {
         let neighbor = cell.neighborsList[nebName];
         
         if(neighbor && !neighbor.tileIndex && neighbor.tilesArray.length === 0) {
            
            let randIndex =  this.rand(cell.tilesArray.length);
            let nebTileType = cell.tilesArray[randIndex];
            neighbor.tileIndex = this.baseTilesTypes.indexOf(nebTileType);
            
            neighbor.tilesArray = this.tilesConnections[nebTileType];
            if(!neighbor.tilesArray.includes(nebTileType)) neighbor.tilesArray.push(nebTileType);

            // ********************************
            // if(neighbor.tileIndex === 0 || neighbor.tileIndex === 3) neighbor.isBlocked = true;
            // ********************************
         }
      });
   }

}