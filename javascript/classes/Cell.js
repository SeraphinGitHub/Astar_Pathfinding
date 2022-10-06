
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
      this.x = i *size;
      this.y = j *size;
      
      this.center = {
         x: this.x + size/2,
         y: this.y + size/2,
      };

      this.neighborsList = {};
      this.cameFromCell;

      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.isBlocked = false;
   }

   // Collision
   line_toSquare(line, isDiamond) {

      let rectCorner;

      // Rect is a Diamond
      if(isDiamond) rectCorner = {

         top: {
            x: this.center.x,
            y: this.y,
         },

         right: {
            x: this.x +this.size,
            y: this.center.y,
         },

         bottom: {
            x: this.center.x,
            y: this.y +this.size,
         },

         left: {
            x: this.x,
            y: this.center.y,
         },
      }

      // Rect is a Square
      else rectCorner = {

         top: {
            x: this.x,
            y: this.y,
         },

         right: {
            x: this.x +this.size,
            y: this.y,
         },

         bottom: {
            x: this.x,
            y: this.y +this.size,
         },

         left: {
            x: this.x +this.size,
            y: this.y +this.size,
         },
      };
      
      const rectSide = {

         left: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX: rectCorner.top.x,
            endY: rectCorner.top.y,
         },

         right: {
            startX: rectCorner.right.x,
            startY: rectCorner.right.y,
            endX: rectCorner.bottom.x,
            endY: rectCorner.bottom.y,
         },

         top: {
            startX: rectCorner.top.x,
            startY: rectCorner.top.y,
            endX: rectCorner.right.x,
            endY: rectCorner.right.y,
         },

         bottom: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX: rectCorner.left.x,
            endY: rectCorner.left.y,
         },
      };

      let topSide    = this.line_toLine(line, rectSide.top   );
      let rightSide  = this.line_toLine(line, rectSide.right );
      let bottomSide = this.line_toLine(line, rectSide.bottom);
      let leftSide   = this.line_toLine(line, rectSide.left  );
   
      
      if(leftSide
      || rightSide
      || topSide
      || bottomSide) return true;
      else return false;
   }
   
   line_toLine(lineA, lineB) {

      const vectorA = {
         x: lineA.endX -lineA.startX,
         y: lineA.endY -lineA.startY,
      }
   
      const vectorB = {
         x: lineB.endX -lineB.startX,
         y: lineB.endY -lineB.startY,
      }
   
      const vectorC = {
         x: lineA.startX -lineB.startX,
         y: lineA.startY -lineB.startY,
      }  
   
      let vectorValueA = vectorA.x *vectorC.y - vectorA.y *vectorC.x;
      let vectorValueB = vectorB.x *vectorC.y - vectorB.y *vectorC.x;
      let denominator = vectorB.y *vectorA.x - vectorB.x *vectorA.y;
      
      let rangeA = Math.floor(vectorValueA /denominator *1000) /1000;
      let rangeB = Math.floor(vectorValueB /denominator *1000) /1000;
      
      if(rangeA >= 0 && rangeA <= 1
      && rangeB >= 0 && rangeB <= 1) return true;
      else return false;
   }


   // NeighborsList
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

      this.setNeb_Left (cellsList, nebID, nebID.left);
      this.setNeb_Right(cellsList, nebID,nebID.right);
      this.setNeb_Top(   () => { this.addNeb(cellsList, nebID,nebID.top   ) });
      this.setNeb_Bottom(() => { this.addNeb(cellsList, nebID,nebID.bottom) });

      // If Euclidean ==> Can search diagonally
      if(this.isEuclidean) {
      
         this.setNeb_Top(() => {
            this.setNeb_Left (cellsList, nebID, nebID.topLeft);
            this.setNeb_Right(cellsList, nebID, nebID.topRight);
         });

         this.setNeb_Bottom(() => {
            this.setNeb_Left (cellsList, nebID, nebID.bottomLeft);
            this.setNeb_Right(cellsList, nebID, nebID.bottomRight);
         });
      }
   } 

   addNeb(cellsList, nebID, id) {
      let side = Object.keys(nebID).find(key => nebID[key] === id);
      this.neighborsList[side] = cellsList[id];
   }


   // Set Neighbors
   setNeb_Left(cellsList, nebID, id) {
      if(this.i -1 >= 0) this.addNeb(cellsList, nebID, id);
   }

   setNeb_Right(cellsList, nebID, id) {
      if(this.i +1 < this.collums) this.addNeb(cellsList, nebID, id);
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
      ctx.lineWidth = 2;
   
      ctx.strokeRect(
         this.x,
         this.y,
         this.size,
         this.size
      );
   }

   drawHover(ctx, position, color) {

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
   
      ctx.strokeRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawID(ctx) {

      ctx.fillStyle = "black";
      ctx.font = "20px Verdana";
      ctx.textAlign = "center";

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

   drawWall(ctx, isTempory) {

      let wallColor;
      if(isTempory) wallColor = "rgba(105, 105, 105, 0.45)";
      else wallColor = "dimgray";
      
      ctx.fillStyle = wallColor;
      ctx.fillRect(
         this.x,
         this.y,
         this.size,
         this.size
      );

   }

   drawWallCollider(ctx) {


      const point = {

         top: {
            x: this.center.x,
            y: this.y,
         },

         right: {
            x: this.x +this.size,
            y: this.center.y,
         },

         bottom: {
            x: this.center.x,
            y: this.y +this.size,
         },

         left: {
            x: this.x,
            y: this.center.y,
         },
      }

      ctx.fillStyle = "red";
      ctx.beginPath();

      ctx.moveTo(point.top.x, point.top.y);
      ctx.lineTo(point.right.x, point.right.y);
      ctx.lineTo(point.bottom.x, point.bottom.y);
      ctx.lineTo(point.left.x, point.left.y);

      ctx.fill();
   }

   drawPathWall(ctx, mouseCell) {

      ctx.strokeStyle = "yellow";
      ctx.beginPath();

      ctx.moveTo(
         this.center.x,
         this.center.y
      );

      ctx.lineTo(
         mouseCell.centerX,
         mouseCell.centerY
      );

      ctx.lineWidth = 4;
      ctx.stroke();
   }

   drawStartEnd(ctx, color) {

      ctx.fillStyle = color;
      ctx.fillRect(
         this.x,
         this.y,
         this.size,
         this.size
      );
   }

}