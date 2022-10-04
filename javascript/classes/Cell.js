
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class Cell {
   constructor(collums, rows, size, isEuclidean, i, j) {
      
      this.id =`${i}-${j}`;
      this.collums = collums;
      this.rows = rows;
      this.size = size;
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
      
      this.isBlocked = false;
   }

   initNeighborsList(cellsList) {

      const nebID = {
         left:  `${this.i -1}-${this.j   }`,
         right: `${this.i +1}-${this.j   }`,
         top:   `${this.i   }-${this.j -1}`,
         bottom:`${this.i   }-${this.j +1}`,

         topLeft:    `${this.i -1}-${this.j -1}`,
         topRight:   `${this.i +1}-${this.j -1}`,
         bottomLeft: `${this.i -1}-${this.j +1}`,
         bottomRight:`${this.i +1}-${this.j +1}`,
      };

      this.setNeb_Left (cellsList, nebID.left);
      this.setNeb_Right(cellsList, nebID.right);
      this.setNeb_Top(   () => { this.addNeb(cellsList, nebID.top   ) });
      this.setNeb_Bottom(() => { this.addNeb(cellsList, nebID.bottom) });


      // If Euclidean ==> Can search diagonally
      if(this.isEuclidean) {

         this.setNeb_Top(() => {
            this.setNeb_Left (cellsList, nebID.topLeft);
            this.setNeb_Right(cellsList, nebID.topRight);
         });

         this.setNeb_Bottom(() => {
            this.setNeb_Left (cellsList, nebID.bottomLeft);
            this.setNeb_Right(cellsList, nebID.bottomRight);
         });
      }
   } 

   addNeb(cellsList, id) {
      this.neighborsList[id] = cellsList[id];
   }


   // Set Neighbors
   setNeb_Left(cellsList, id) {
      if(this.i -1 >= 0) this.addNeb(cellsList, id);
   }

   setNeb_Right(cellsList, id) {
      if(this.i +1 < this.collums) this.addNeb(cellsList, id);
   }

   setNeb_Top(callback) {
      if(this.j -1 >= 0) callback();
   }

   setNeb_Bottom(callback) {
      if(this.j +1 < this.rows) callback();
   }


   // Draw
   drawCenter(ctx) {

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
         this.center.x,
         this.center.y,
         4, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawFrame(ctx) {

      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 2;
      ctx.font = "20px Verdana";
      ctx.textAlign = "center";
   
      ctx.strokeRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );

      ctx.fillText(
         this.id,
         this.center.x,
         this.center.y -15
      );
   }

   drawData(ctx) {

      ctx.fillStyle = "white";
      ctx.font = "18px Verdana";
      ctx.textAlign = "left";

      let offsetX = 27;

      // hCost
      ctx.fillText(
         `h:${this.hCost}`,
         this.center.x -offsetX,
         this.center.y -12
      );

      // gCost
      ctx.fillText(
         `g:${this.gCost}`,
         this.center.x -offsetX,
         this.center.y +5
      );

      // fCost
      ctx.fillText(
         `f:${this.fCost}`,
         this.center.x -offsetX,
         this.center.y +27
      );      
   }

   drawTile(ctx, position, color) {

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
   
      ctx.strokeRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawWall(ctx, position) {

      ctx.fillStyle = "dimgray";
      ctx.fillRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawStartEnd(ctx, color) {

      ctx.fillStyle = color;
      ctx.fillRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );
   }

}