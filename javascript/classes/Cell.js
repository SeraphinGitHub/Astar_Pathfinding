
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class Cell {
   constructor(ctx, collums, rows, size, i, j, isEuclidean) {

      this.ctx = ctx;

      this.collums = collums;
      this.rows = rows;
      this.size = size;
      this.i = i;
      this.j = j;
      
      this.center = {
         x: i *size + size/2,
         y: j *size + size/2,
      };

      // Manhattan Neighbors
      this.manhattan = {

         left: {
            x: this.center.x -this.size,
            y: this.center.y
         },

         right: {
            x: this.center.x +this.size,
            y: this.center.y
         },

         top: {
            x: this.center.x,
            y: this.center.y -this.size
         },

         bottom: {
            x: this.center.x,
            y: this.center.y +this.size
         }
      };

      // Euclidean Neighbors
      this.euclidean = {

         topLeft: {
            x: this.manhattan.left.x,
            y: this.manhattan.top.y
         },
         
         topRight: {
            x: this.manhattan.right.x,
            y: this.manhattan.top.y
         },
         
         bottomLeft: {
            x: this.manhattan.left.x,
            y: this.manhattan.bottom.y
         },
         
         bottomRight: {
            x: this.manhattan.right.x,
            y: this.manhattan.bottom.y
         }
      };

      this.neighborsList = {};
      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.isParsable;
      this.isBuildable;
      this.isWalkable;

      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
   }

   setID(i, j) {
      return `${i}-${j}`;
   }

   initNeighborsList() {

      // Set Manhattan Neighbors
      this.setNeighbor().left   (this.addNeighbor(-1,  0, this.manhattan.left));
      this.setNeighbor().right  (this.addNeighbor( 1,  0, this.manhattan.right));
      this.setNeighbor().top    (this.addNeighbor( 0, -1, this.manhattan.top));
      this.setNeighbor().bottom (this.addNeighbor( 0,  1, this.manhattan.bottom));


      // Set Euclidean Neighbors if euclidean is active
      // ==> Can search diagonally
      if(this.isEuclidean) {

         this.setNeighbor().top(() => {

            this.setNeighbor().left  (this.addNeighbor(-1, -1, this.euclidean.topLeft));
            this.setNeighbor().right (this.addNeighbor( 1, -1, this.euclidean.topRight));
         });

         this.setNeighbor().bottom(() => {
            
            this.setNeighbor().left  (this.addNeighbor(-1, 1, this.euclidean.bottomLeft));
            this.setNeighbor().right (this.addNeighbor( 1, 1, this.euclidean.bottomRight));
         });
      }
   }

   addNeighbor(iValue, jValue, neighbor) {

      const id = this.setID(this.i +iValue, this.j +jValue);
      this.neighborsList[id] = neighbor;
   }

   setNeighbor() {
      return {

         left: (callback) => {
            if(this.manhattan.left.x > 0) callback();
         },
      
         right: (callback) => {
            if(this.manhattan.right.x < this.collums *this.size) callback();
         },
      
         top: (callback) => {
            if(this.manhattan.top.y > 0) callback();
         },
      
         bottom: (callback) => {
            if(this.manhattan.bottom.y < this.rows *this.size) callback();
         },
      }
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
         this.setID(this.i, this.j),
         this.center.x,
         this.center.y -25
      );
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

}