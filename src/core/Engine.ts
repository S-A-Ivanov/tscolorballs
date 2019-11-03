class Engine {
    public static HIGHSCORE_KEY:string = "ru.urvanov.tscolorballs.highScore";
    public static BOARD_WIDTH:number = 10;
    public static BOARD_HEIGHT:number = 10;
    public static TICK_MILLISECONDS = 80;
    public static TILE_WIDTH:number = 32;
    public static TILE_HEIGHT:number = 32;
    public static EMPTY_COLOR:string = "#404040";

    private board:Board;
    private canvas:HTMLCanvasElement;
    private situation:Situation = Situation.CLEAR_SCREEN;
    private score:number;
    private highScore:number;

    public constructor() {
        this.score = 0;
        this.highScore = 0;
        this.board = new Board(Engine.BOARD_WIDTH, Engine.BOARD_HEIGHT);
        this.canvas = <HTMLCanvasElement>document
                .getElementById("tscolorballscanvas");
        this.initGame();
        let engine = this;        
        this.canvas.addEventListener("mousedown",
                function(event) { engine.onClick(event) });
        this.readHighScoreFromStorage();
        this.onStep();
    }

    private readHighScoreFromStorage():void {
        try {
            if (window.localStorage) {
                this.highScore = window.localStorage[Engine.HIGHSCORE_KEY];
            }
            if (this.highScore === undefined) {
                this.highScore = 0;
            }
        } catch (ex) {
            this.highScore = 0;;
        }
    }
    
    private saveHighScoreToStorage():void {
        try {
            window.localStorage[Engine.HIGHSCORE_KEY] = this.highScore;
        } catch (ex) {
            console.error(ex);
        }
    }

    private initGame():void {
        this.score = 0;
        this.board.resetBoard();        
        this.situation = Situation.GAME;

    }
 
    private onStep():void {        
        let engine = this;
        
        let ctx:CanvasRenderingContext2D = <CanvasRenderingContext2D>this.canvas
                .getContext("2d");
        switch (this.situation) {
            case Situation.ANIMATION:
                setTimeout(function () { engine.onStep(); }, Engine.TICK_MILLISECONDS);                
                this.processGravity();
                this.paintGame(ctx);
                break;            
            case Situation.GAME:
                this.paintGame(ctx);
                break;
            case Situation.END_GAME:
                this.paintGame(ctx);
                this.paintEndGame(ctx);                
                break;
        }
        this.paintStatus(ctx);
        if (console) console.log("endOnStep");
    }

    private processGravity():void {
        let movesCount:number = 0;
        for (let x = 0; x < Engine.BOARD_WIDTH; x++) {
            for (let y = 0; y < Engine.BOARD_HEIGHT - 1; y++) {
                let tileState:TileState = this.board.getTileState(x, y);
                if ((tileState != TileState.EMPTY)
                        && (this.board.getTileState(x, y + 1) == TileState.EMPTY)) {
                    this.board.setTileState(x, y + 1, tileState);
                    this.board.setTileState(x, y, TileState.EMPTY);
                    movesCount++;
                }
            }
        }
        for (let x = 1; x < Engine.BOARD_WIDTH; x++) {
            let lastLineY:number = Engine.BOARD_HEIGHT - 1;
            let lastLineTileState:TileState = this.board.getTileState(x, lastLineY);
            if ((lastLineTileState != TileState.EMPTY)
                    && (this.board.getTileState(x - 1, lastLineY) == TileState.EMPTY)) {
                for (let y = 0; y < Engine.BOARD_HEIGHT; y++ ) {
                let tileState = this.board.getTileState(x, y);
                    this.board.setTileState(x - 1, y, tileState);
                    this.board.setTileState(x, y, TileState.EMPTY);
                    movesCount++;
                }
            }
            for (let y = 0; y < Engine.BOARD_HEIGHT; y++) {
                
            }
        }
        if (movesCount == 0) {
           if (!this.checkEndGame()) {
                this.situation = Situation.END_GAME;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.saveHighScoreToStorage();
                }
             }
            else this.situation = Situation.GAME;
        }
    }

    
    private paintEndGame(ctx:CanvasRenderingContext2D):void {
        ctx.fillStyle="#404040";
        ctx.fillRect(10, Engine.TILE_HEIGHT * (Engine.BOARD_HEIGHT / 2 - 1),
                Engine.TILE_WIDTH * Engine.BOARD_WIDTH - 20, Engine.TILE_HEIGHT * 2);
        ctx.fillStyle="#ffff00";
        ctx.font="40px Courier New";
        var gameOverString ="GAME OVER";
        ctx.fillText(gameOverString, Engine.TILE_WIDTH *
                (Engine.BOARD_WIDTH/ 2) - ctx.measureText(gameOverString)
                .width / 2, Engine.TILE_HEIGHT * (Engine.BOARD_HEIGHT/ 2));
        var yourScore = "score: " + this.score;
        ctx.fillText(yourScore, Engine.TILE_WIDTH * (Engine.BOARD_WIDTH/ 2) -
                ctx.measureText(yourScore).width / 2, Engine.TILE_HEIGHT *
                    (Engine.BOARD_HEIGHT / 2 + 1));
    }
    
    private paintStatus(ctx:CanvasRenderingContext2D):void {
        ctx.fillStyle = Engine.EMPTY_COLOR;
        ctx.fillRect(0, Engine.TILE_HEIGHT * Engine.BOARD_HEIGHT,
                Engine.TILE_WIDTH * Engine.BOARD_WIDTH, 
                Engine.TILE_WIDTH * Engine.BOARD_WIDTH
                        + Engine.TILE_HEIGHT - 3)
        ctx.font="20px Courier New";
        ctx.strokeStyle="#0000ff";
        ctx.fillStyle="#ffff00";
 
        let scoreString:string = "00000000" + this.score;
        scoreString = scoreString.slice(
                scoreString.length - 8, scoreString.length);
        ctx.fillText("score:  " + scoreString, 0, Engine.TILE_HEIGHT
                * Engine.BOARD_HEIGHT + Engine.TILE_HEIGHT - 3);
        scoreString = "00000000" + this.highScore;
                scoreString= scoreString.slice(
                        scoreString.length - 8, scoreString.length);
        ctx.fillText("high :  " + scoreString, 0, Engine.TILE_HEIGHT *
                Engine.BOARD_HEIGHT + Engine.TILE_HEIGHT *1.5 - 3);
    }
    
    private clearScreen(ctx:CanvasRenderingContext2D):void {
        ctx.fillStyle = Engine.EMPTY_COLOR;
        ctx.fillRect(0, 0, Engine.BOARD_WIDTH * Engine.TILE_WIDTH,
                Engine.BOARD_HEIGHT * Engine.TILE_HEIGHT);
    }
   
    private paintGame(ctx:CanvasRenderingContext2D):void {
        this.clearScreen(ctx);
        for (let x:number = 0; x < Engine.BOARD_WIDTH; x++) {
            for (let y:number = 0; y < Engine.BOARD_HEIGHT; y++) {
                switch (this.board.getTileState(x, y)) {                    
                    case TileState.RED:
                        this.drawCircle(ctx, x, y, "#ba4747");
                        break;
                    case TileState.GREEN:
                        this.drawCircle(ctx, x, y, "#356637");
                        break;
                    case TileState.BLUE:
                        this.drawCircle(ctx, x, y, "#678beb");
                        break;
                    case TileState.YELLOW:
                        this.drawCircle(ctx, x, y, "#bebb70");
                        break;
                }
            }
        }
    }
    
    private drawCircle(ctx: CanvasRenderingContext2D,
            x:number, y: number, color:string):void {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(
                    x * Engine.TILE_WIDTH + Engine.TILE_WIDTH / 2,
                    y * Engine.TILE_HEIGHT + Engine.TILE_HEIGHT / 2,
                    Engine.TILE_WIDTH / 2, // radius
                    0, // startAngle
                    2 * Math.PI, // endAngle
                    false // clockwise
                    );
        ctx.fill();
        ctx.stroke();
    }

    private onClick(event:MouseEvent):void {
        let canvasPosition = this.getElementPosition(this.canvas);

        let mouseX = event.pageX - canvasPosition.x;
        let mouseY = event.pageY - canvasPosition.y;
        this.onStep();
        switch (this.situation) {
            case Situation.GAME:
                let tileX = Math.floor(mouseX / Engine.TILE_WIDTH);
                let tileY = Math.floor(mouseY / Engine.TILE_HEIGHT);              
                if (this.board.getTileState(tileX, tileY) != TileState.EMPTY) {
                    let removedCount = this.removeSameBalls(tileX, tileY);
                    if (removedCount > 1) {
                        this.situation = Situation.ANIMATION;
                        this.onStep();
                        this.score += removedCount * removedCount;
                    }                   
                }
                break;
            case Situation.END_GAME:
                this.initGame();
                this.onStep();                
                break;
        }
    }

    // Get X and Y position of the elm (from: vishalsays.wordpress.com)
    private getElementPosition(elm:any):Point {
        var x = elm.offsetLeft;        // set x to elm's offsetLeft
        var y = elm.offsetTop;         // set y to elm's offsetTop

        elm = elm.offsetParent;    // set elm to its offsetParent

        // use while loop to check if elm is null
        // if not then add current elm?s offsetLeft to x
        // offsetTop to y and set elm to its offsetParent
        while(elm != null) {
            x = parseInt(x) + parseInt(elm.offsetLeft);
            y = parseInt(y) + parseInt(elm.offsetTop);
            elm = elm.offsetParent;
        }

        // returns an object with "xp" (Left), "=yp" (Top) position
        return new Point(x, y);
    }

    private removeSameBalls(tileX: number, tileY: number):number {
        let a:ProcessState[][] = new Array<Array<ProcessState>>();
        for (let n:number = 0; n < Engine.BOARD_WIDTH; n++) {
            a[n] = new Array<ProcessState>(Engine.BOARD_HEIGHT);
            for (let m:number = 0; m < Engine.BOARD_HEIGHT; m++) {
                a[n][m] = ProcessState.READY;
            }
        }
 
        let pointsToProcess:Point[] = new Array<Point>();
        let toRemove:Point[] = new Array<Point>();
 
        pointsToProcess.push(new Point(tileX, tileY));
        let tileState:TileState = this.board.getTileState(tileX, tileY);
        while (pointsToProcess.length > 0) {
            let point = <Point>pointsToProcess.pop();
            a[point.x][point.y] = ProcessState.PROCESSED;
            toRemove.push(point);          
            if (point.x > 0) {
                this.pushIfSameColorAndNotProcessed(
                        pointsToProcess, a, new Point(point.x - 1, point.y),
                        tileState);
            }
            if (point.x < Engine.BOARD_WIDTH - 1) {
                this.pushIfSameColorAndNotProcessed(
                        pointsToProcess, a, new Point(point.x + 1, point.y),
                        tileState);
            }
            if (point.y > 0) {
                this.pushIfSameColorAndNotProcessed(
                        pointsToProcess, a, new Point(point.x, point.y - 1),
                        tileState);
            }                                                           
            if (point.y < Engine.BOARD_HEIGHT - 1) {
                this.pushIfSameColorAndNotProcessed(
                        pointsToProcess, a, new Point(point.x, point.y + 1),
                        tileState);
            }           
        }
        if (toRemove.length > 1) {
            for (let n = 0; n < toRemove.length; n++) {
                let point:Point = toRemove[n];
                this.board.setTileState(point.x, point.y, TileState.EMPTY);
            }
        }
        return toRemove.length;
    }
 
 
    private pushIfSameColorAndNotProcessed(pointsToProcess:Point[], a: ProcessState[][], point:Point, tileState:TileState): void {
        if ((this.board.getTileState(point.x, point.y) == tileState)
                && (a[point.x][point.y] == ProcessState.READY)) {
            pointsToProcess.push(point);
        }
    }

    private checkEndGame():boolean {
        for (let n:number = 0; n < Engine.BOARD_WIDTH; n++) {
            for (let m:number = 0; m < Engine.BOARD_HEIGHT; m++) {
                let tileState:TileState = this.board.getTileState(n, m);
                if ((tileState != TileState.EMPTY) &&
                        ((tileState == this.board.getTileState(n + 1, m)) ||
                        (tileState == this.board.getTileState(n, m + 1)))) {
                    return true;
                }
            }
        }
        return false;
    }

}
