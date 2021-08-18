"use strict";
(() => {
  class PuzzleRenderer {
    // puzzle クラスのインスタンスと、描画する領域をさせ変えられるように、 canvas を分けて渡してプロパティとして保持。
    constructor(puzzle, canvas) {
      this.puzzle = puzzle;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.TILE_SIZE = 70;
      this.img = document.createElement("img");
      // this.img.src = "img/animal1.png";
      this.img.src = "img/ken.jpg";
      this.img.addEventListener("load", () => {
        this.render();
      });

      // Cavas の位置やサイズに関するオブジェクトを取得。
      this.canvas.addEventListener("click", (e) => {
        // ゲームをクリアしたときは、早期リターン。
        if (this.puzzle.getCompletedStatus()) {
          return;
        }

        const rect = this.canvas.getBoundingClientRect();

        // 座標原点位置を canvas の左上にする。
        // 取得した座標が、何列、何行目に当たるかを計算する。
        const col = Math.floor((e.clientX - rect.left) / this.TILE_SIZE);
        const row = Math.floor((e.clientY - rect.top) / this.TILE_SIZE);

        // クリックした位置の周囲に、15 があったら入れ替える処理。
        this.puzzle.swapTiles(col, row);
        this.render();

        // ゲームクリア画面の表示。
        if (this.puzzle.isComplete()) {
          this.puzzle.setCompletedStatus(true);
          this.renderGameClear();
        }
      });
    }
    renderGameClear() {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.font = "28px Arial";
      this.ctx.fillStyle = "#fff";
      this.ctx.fillText("GAME CLEAR!!", 40, 150);
    }

    render() {
      for (let row = 0; row < this.puzzle.getBoardSize(); row++) {
        for (let col = 0; col < this.puzzle.getBoardSize(); col++) {
          this.renderTile(this.puzzle.getTile(row, col), col, row);
        }
      }
    }

    renderTile(n, col, row) {
      // 空白の部分の画像をグレーで表示する。
      if (n === this.puzzle.getBlankIndex()) {
        this.ctx.fillStyle = "#eeeeee";
        this.ctx.fillRect(
          col * this.TILE_SIZE,
          row * this.TILE_SIZE,
          this.TILE_SIZE,
          this.TILE_SIZE
        );
      } else {
        this.ctx.drawImage(
          this.img,
          (n % this.puzzle.getBoardSize()) * this.TILE_SIZE,
          Math.floor(n / this.puzzle.getBoardSize()) * this.TILE_SIZE,
          this.TILE_SIZE,
          this.TILE_SIZE,
          col * this.TILE_SIZE,
          row * this.TILE_SIZE,
          this.TILE_SIZE,
          this.TILE_SIZE
        );
      }
    }
  }

  class Puzzle {
    constructor(level) {
      this.level = level;
      this.tiles = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
      ];

      this.UDLR = [
        [0, -1], // up
        [0, 1], //down
        [-1, 0], //left
        [1, 0], //right
      ];

      // ゲームをクリアしているかどうかをプロパティで保持。
      this.isCompleted = false;

      this.BOARD_SIZE = this.tiles.length;
      this.BLANK_INDEX = this.BOARD_SIZE ** 2 - 1;
      
      do {
        this.shuffle(this.level);
      } while (this.isComplete());
    }

    getBoardSize() {
      return this.BOARD_SIZE;
    }

    getBlankIndex() {
      return this.BLANK_INDEX;
    }

    getCompletedStatus() {
      return this.isCompleted;
    }

    setCompletedStatus(value) {
      this.isCompleted = value;
    }

    getTile(row, col) {
      return this.tiles[row][col];
    }

    // シャッフルする回数を引数で渡す。
    shuffle(n) {
      // 空白の初期位置を設定。
      let blankCol = this.BOARD_SIZE - 1;
      let blankRow = this.BOARD_SIZE - 1;

      // n 回シャッフルを行う。
      for (let i = 0; i < n; i++) {
        // 空白を動かす先の列と行を変数で宣言。
        let destCol;
        let destRow;

        // tiles の範囲外になる場合はやり直す。
        do {
          // 上下左右のどこに動かすかをランダムに決めるための条件分岐処理。
          const dir = Math.floor(Math.random() * this.UDLR.length);

          destCol = blankCol + this.UDLR[dir][0];
          destRow = blankRow + this.UDLR[dir][1];
        } while (this.isOutside(destCol, destRow));

        [this.tiles[blankRow][blankCol], this.tiles[destRow][destCol]] = [
          this.tiles[destRow][destCol],
          this.tiles[blankRow][blankCol],
        ];

        [blankCol, blankRow] = [destCol, destRow];
      }
    }

    swapTiles(col, row) {
      // クリックされた場所が 15 だったらなにもしない。
      if (this.tiles[row][col] === this.BLANK_INDEX) {
        return;
      }

      // クリックしたタイルの上下左右が空白か調べる処理を、 for 文で 4 回ループを回す。
      for (let i = 0; i < this.UDLR.length; i++) {
        // 調べたいタイルの列と行を定義。
        const destCol = col + this.UDLR[i][0];
        const destRow = row + this.UDLR[i][1];

        if (this.isOutside(destCol, destRow)) {
          continue;
        }

        // this.tiles の destRow と destCol の中身が 15 (空白)だったら入れ替える処理。
        if (this.tiles[destRow][destCol] === this.BLANK_INDEX) {
          [this.tiles[row][col], this.tiles[destRow][destCol]] = [
            this.tiles[destRow][destCol],
            this.tiles[row][col],
          ];

          // 入れ替えたらループを抜ける。
          break;
        }
      }
    }

    // this.tiles の範囲を超えないようチェックする処理。
    isOutside(destCol, destRow) {
      return (
        destCol < 0 ||
        destCol > this.BOARD_SIZE - 1 ||
        destRow < 0 ||
        destRow > this.BOARD_SIZE - 1
      );
    }

    // ゲームクリア判定。
    // tiles が 0 から 15 まで並んでいるかで判定。
    isComplete() {
      let i = 0;
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        for (let col = 0; col < this.BOARD_SIZE; col++) {
          if (this.tiles[row][col] !== i++) {
            return false;
          }
        }
      }
      return true;
    }
  }

  const canvas = document.querySelector("canvas");
  if (typeof canvas.getContext === "undefined") {
    return;
  }

  new PuzzleRenderer(new Puzzle(2), canvas);
})();
