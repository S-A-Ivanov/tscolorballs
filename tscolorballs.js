"use strict";
class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = Array();
        this.reset();
    }
    reset() {
        for (let n = 0; n < this.width; n++) {
            this.tiles[n] = new Array(this.height);
            for (let m = 0; m < this.height; m++) {
                this.tiles[n][m] = this.randomInteger(1, Board.TILE_TYPES_COUNT);
            }
        }
    }
    randomInteger(min, max) {
        let rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    }
    getTileState(x, y) {
        return this.tiles[x][y];
    }
    setTileState(x, y, tileState) {
        this.tiles[x][y] = tileState;
    }
}
Board.TILE_TYPES_COUNT = 4;
class Engine {
    constructor() {
        this.situation = Situation.CLEAR_SCREEN;
        this.score = 0;
        this.highScore = 0;
        this.board = new Board(Engine.BOARD_WIDTH, Engine.BOARD_HEIGHT);
        this.canvas = document
            .getElementById("tscolorballscanvas");
        this.initGame();
        let engine = this;
        this.canvas.addEventListener("mousedown", function (event) { engine.onClick(event); });
        this.readHighScoreFromStorage();
        this.onStep();
    }
    readHighScoreFromStorage() {
        try {
            if (window.localStorage) {
                this.highScore = window.localStorage[Engine.HIGHSCORE_KEY];
            }
            if (this.highScore === undefined) {
                this.highScore = 0;
            }
        }
        catch (ex) {
            this.highScore = 0;
            ;
        }
    }
    saveHighScoreToStorage() {
        try {
            window.localStorage[Engine.HIGHSCORE_KEY] = this.highScore;
        }
        catch (ex) {
            console.error(ex);
        }
    }
    initGame() {
        this.score = 0;
        this.board.reset();
        this.situation = Situation.GAME;
    }
    onStep() {
        let engine = this;
        let ctx = this.canvas
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
        if (console)
            console.log("endOnStep");
    }
    processGravity() {
        let movesCount = 0;
        for (let x = 0; x < Engine.BOARD_WIDTH; x++) {
            for (let y = 0; y < Engine.BOARD_HEIGHT - 1; y++) {
                let tileState = this.board.getTileState(x, y);
                if ((tileState != TileState.EMPTY)
                    && (this.board.getTileState(x, y + 1) == TileState.EMPTY)) {
                    this.board.setTileState(x, y + 1, tileState);
                    this.board.setTileState(x, y, TileState.EMPTY);
                    movesCount++;
                }
            }
        }
        for (let x = 1; x < Engine.BOARD_WIDTH; x++) {
            let lastLineY = Engine.BOARD_HEIGHT - 1;
            let lastLineTileState = this.board.getTileState(x, lastLineY);
            if ((lastLineTileState != TileState.EMPTY)
                && (this.board.getTileState(x - 1, lastLineY) == TileState.EMPTY)) {
                for (let y = 0; y < Engine.BOARD_HEIGHT; y++) {
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
            else
                this.situation = Situation.GAME;
        }
    }
    paintEndGame(ctx) {
        ctx.fillStyle = "#404040";
        ctx.fillRect(10, Engine.TILE_HEIGHT * (Engine.BOARD_HEIGHT / 2 - 1), Engine.TILE_WIDTH * Engine.BOARD_WIDTH - 20, Engine.TILE_HEIGHT * 2);
        ctx.fillStyle = "#ffff00";
        ctx.font = "40px Courier New";
        var gameOverString = "GAME OVER";
        ctx.fillText(gameOverString, Engine.TILE_WIDTH *
            (Engine.BOARD_WIDTH / 2) - ctx.measureText(gameOverString)
            .width / 2, Engine.TILE_HEIGHT * (Engine.BOARD_HEIGHT / 2));
        var yourScore = "score: " + this.score;
        ctx.fillText(yourScore, Engine.TILE_WIDTH * (Engine.BOARD_WIDTH / 2) -
            ctx.measureText(yourScore).width / 2, Engine.TILE_HEIGHT *
            (Engine.BOARD_HEIGHT / 2 + 1));
    }
    paintStatus(ctx) {
        ctx.fillStyle = Engine.EMPTY_COLOR;
        ctx.fillRect(0, Engine.TILE_HEIGHT * Engine.BOARD_HEIGHT, Engine.TILE_WIDTH * Engine.BOARD_WIDTH, Engine.TILE_WIDTH * Engine.BOARD_WIDTH
            + Engine.TILE_HEIGHT - 3);
        ctx.font = "20px Courier New";
        ctx.strokeStyle = "#0000ff";
        ctx.fillStyle = "#ffff00";
        let scoreString = "00000000" + this.score;
        scoreString = scoreString.slice(scoreString.length - 8, scoreString.length);
        ctx.fillText("score:  " + scoreString, 0, Engine.TILE_HEIGHT
            * Engine.BOARD_HEIGHT + Engine.TILE_HEIGHT - 3);
        scoreString = "00000000" + this.highScore;
        scoreString = scoreString.slice(scoreString.length - 8, scoreString.length);
        ctx.fillText("high :  " + scoreString, 0, Engine.TILE_HEIGHT *
            Engine.BOARD_HEIGHT + Engine.TILE_HEIGHT * 1.5 - 3);
    }
    clearScreen(ctx) {
        ctx.fillStyle = Engine.EMPTY_COLOR;
        ctx.fillRect(0, 0, Engine.BOARD_WIDTH * Engine.TILE_WIDTH, Engine.BOARD_HEIGHT * Engine.TILE_HEIGHT);
    }
    paintGame(ctx) {
        this.clearScreen(ctx);
        for (let x = 0; x < Engine.BOARD_WIDTH; x++) {
            for (let y = 0; y < Engine.BOARD_HEIGHT; y++) {
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
    drawCircle(ctx, x, y, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x * Engine.TILE_WIDTH + Engine.TILE_WIDTH / 2, y * Engine.TILE_HEIGHT + Engine.TILE_HEIGHT / 2, Engine.TILE_WIDTH / 2, // radius
        0, // startAngle
        2 * Math.PI, // endAngle
        false // clockwise
        );
        ctx.fill();
        ctx.stroke();
    }
    onClick(event) {
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
    getElementPosition(elm) {
        var x = elm.offsetLeft; // set x to elm's offsetLeft
        var y = elm.offsetTop; // set y to elm's offsetTop
        elm = elm.offsetParent; // set elm to its offsetParent
        // use while loop to check if elm is null
        // if not then add current elm?s offsetLeft to x
        // offsetTop to y and set elm to its offsetParent
        while (elm != null) {
            x = parseInt(x) + parseInt(elm.offsetLeft);
            y = parseInt(y) + parseInt(elm.offsetTop);
            elm = elm.offsetParent;
        }
        // returns an object with "xp" (Left), "=yp" (Top) position
        return new Point(x, y);
    }
    removeSameBalls(tileX, tileY) {
        let a = new Array();
        for (let n = 0; n < Engine.BOARD_WIDTH; n++) {
            a[n] = new Array(Engine.BOARD_HEIGHT);
            for (let m = 0; m < Engine.BOARD_HEIGHT; m++) {
                a[n][m] = ProcessState.READY;
            }
        }
        let pointsToProcess = new Array();
        let toRemove = new Array();
        pointsToProcess.push(new Point(tileX, tileY));
        let tileState = this.board.getTileState(tileX, tileY);
        while (pointsToProcess.length > 0) {
            let point = pointsToProcess.pop();
            a[point.x][point.y] = ProcessState.PROCESSED;
            toRemove.push(point);
            if (point.x > 0) {
                this.pushIfSameColorAndNotProcessed(pointsToProcess, a, new Point(point.x - 1, point.y), tileState);
            }
            if (point.x < Engine.BOARD_WIDTH - 1) {
                this.pushIfSameColorAndNotProcessed(pointsToProcess, a, new Point(point.x + 1, point.y), tileState);
            }
            if (point.y > 0) {
                this.pushIfSameColorAndNotProcessed(pointsToProcess, a, new Point(point.x, point.y - 1), tileState);
            }
            if (point.y < Engine.BOARD_HEIGHT - 1) {
                this.pushIfSameColorAndNotProcessed(pointsToProcess, a, new Point(point.x, point.y + 1), tileState);
            }
        }
        if (toRemove.length > 1) {
            for (let n = 0; n < toRemove.length; n++) {
                let point = toRemove[n];
                this.board.setTileState(point.x, point.y, TileState.EMPTY);
            }
        }
        return toRemove.length;
    }
    pushIfSameColorAndNotProcessed(pointsToProcess, a, point, tileState) {
        if ((this.board.getTileState(point.x, point.y) == tileState)
            && (a[point.x][point.y] == ProcessState.READY)) {
            pointsToProcess.push(point);
        }
    }
    checkEndGame() {
        for (let n = 0; n < Engine.BOARD_WIDTH; n++) {
            for (let m = 0; m < Engine.BOARD_HEIGHT; m++) {
                let tileState = this.board.getTileState(n, m);
                if ((tileState != TileState.EMPTY)) {
                    if ((n + 1) < Engine.BOARD_WIDTH)
                        if (tileState == this.board.getTileState(n + 1, m))
                            return true;
                    if ((m + 1) < Engine.BOARD_HEIGHT)
                        if (tileState == this.board.getTileState(n, m + 1))
                            return true;
                }
            }
        }
        return false;
    }
}
Engine.HIGHSCORE_KEY = "ru.urvanov.tscolorballs.highScore";
Engine.BOARD_WIDTH = 10;
Engine.BOARD_HEIGHT = 10;
Engine.TICK_MILLISECONDS = 80;
Engine.TILE_WIDTH = 32;
Engine.TILE_HEIGHT = 32;
Engine.EMPTY_COLOR = "#404040";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
var ProcessState;
(function (ProcessState) {
    ProcessState[ProcessState["READY"] = 0] = "READY";
    ProcessState[ProcessState["PROCESSED"] = 1] = "PROCESSED";
})(ProcessState || (ProcessState = {}));
var Situation;
(function (Situation) {
    Situation[Situation["CLEAR_SCREEN"] = 0] = "CLEAR_SCREEN";
    Situation[Situation["GAME"] = 1] = "GAME";
    Situation[Situation["ANIMATION"] = 2] = "ANIMATION";
    Situation[Situation["SHOW_SCORE"] = 3] = "SHOW_SCORE";
    Situation[Situation["END_GAME"] = 4] = "END_GAME";
})(Situation || (Situation = {}));
var TileState;
(function (TileState) {
    TileState[TileState["EMPTY"] = 0] = "EMPTY";
    TileState[TileState["RED"] = 1] = "RED";
    TileState[TileState["GREEN"] = 2] = "GREEN";
    TileState[TileState["BLUE"] = 3] = "BLUE";
    TileState[TileState["YELLOW"] = 4] = "YELLOW";
})(TileState || (TileState = {}));
// Created by https://urvanov.ru
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        let engine = new Engine();
    });
})();
