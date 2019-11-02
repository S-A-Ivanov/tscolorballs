class Board {
    private static TILE_TYPES_COUNT:number = 4;
    private tiles:TileState[][];
    private width:number;
    private height:number;
    
    public constructor(width:number,height:number) {
        this.width = width;
        this.height = height;
        this.tiles = Array<Array<TileState>>();
        this.resetBoard();        
    }
    public resetBoard():void{
        for(let n:number = 0; n <this. width; n++){
            this.tiles[n] = new Array<TileState>(this.height);

            for(let m:number =0; m < this.height; m++){
                this.tiles[n][m] = this.randomInteger(1, Board.TILE_TYPES_COUNT);
            }
        }
    }
    
 
    private randomInteger(min:number, max:number) {
        let rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    }

    public getTileState(x:number, y:number):TileState {
        return this.tiles[x][y];
    }

    public setTileState(x:number, y:number, tileState:TileState):void {
        this.tiles[x][y] = tileState;
    }

}
