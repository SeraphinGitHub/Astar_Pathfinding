
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class Cell {
   constructor(ctx, collums, rows, size, cellsList, isEuclidean, i, j) {

      this.ctx = ctx;
      
      this.id =`${i}-${j}`;
      this.collums = collums;
      this.rows = rows;
      this.size = size;
      this.cellsList = cellsList;
      this.isEuclidean = isEuclidean;
      this.i = i;
      this.j = j;
      
      this.center = {
         x: i *size + size/2,
         y: j *size + size/2,
      };

      this.neighborsList = {};
      this.cameFromCell;

      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.isWalkable = true;
   }

   initNeighborsList() {

      const neighborsID = {
         left:  `${this.i -1}-${this.j   }`,
         right: `${this.i +1}-${this.j   }`,
         top:   `${this.i   }-${this.j -1}`,
         bottom:`${this.i   }-${this.j +1}`,

         topLeft:    `${this.i -1}-${this.j -1}`,
         topRight:   `${this.i +1}-${this.j -1}`,
         bottomLeft: `${this.i -1}-${this.j +1}`,
         bottomRight:`${this.i +1}-${this.j +1}`,
      };

      this.setNeighbor().left  (() => { this.addNeighbor(neighborsID.left) });
      this.setNeighbor().top   (() => { this.addNeighbor(neighborsID.top) });
      this.setNeighbor().right (() => { this.addNeighbor(neighborsID.right) });
      this.setNeighbor().bottom(() => { this.addNeighbor(neighborsID.bottom) });


      // If Euclidean ==> Can search diagonally
      if(this.isEuclidean) {

         this.setNeighbor().top(() => {
            this.setNeighbor().left (() => { this.addNeighbor(neighborsID.topLeft) });
            this.setNeighbor().right(() => { this.addNeighbor(neighborsID.topRight) });
         });

         this.setNeighbor().bottom(() => {
            this.setNeighbor().right(() => { this.addNeighbor(neighborsID.bottomRight) });
            this.setNeighbor().left (() => { this.addNeighbor(neighborsID.bottomLeft) });
         });
      }
   } 

   addNeighbor(id) {
      this.neighborsList[id] = this.cellsList[id];
   }

   setNeighbor() {
      return {

         left: (callback) => {
            if(this.i -1 >= 0) callback();
         },
      
         right: (callback) => {
            if(this.i +1 < this.collums) callback();
         },
      
         top: (callback) => {
            if(this.j -1 >= 0) callback();
         },
      
         bottom: (callback) => {
            if(this.j +1 < this.rows) callback();
         },
      }
   }

   drawCenter() {

      this.ctx.fillStyle = "red";
      this.ctx.beginPath();
      this.ctx.arc(
         this.center.x,
         this.center.y,
         4, 0, Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.closePath();
   }

   drawFrame() {

      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "black";
      this.ctx.lineWidth = 2;
      this.ctx.font = "20px Verdana";
      this.ctx.textAlign = "center";
   
      this.ctx.strokeRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );

      this.ctx.fillText(
         this.id,
         this.center.x,
         this.center.y -15
      );
   }

   drawTile(position, color) {

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 4;
   
      this.ctx.strokeRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawWall(position) {

      this.ctx.fillStyle = "dimgray";
      this.ctx.fillRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawPos(color) {

      this.ctx.fillStyle = color;
      this.ctx.fillRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );
   }

}