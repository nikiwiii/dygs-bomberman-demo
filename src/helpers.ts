export class Helper {
  public query = document.querySelector.bind(document)
  public id = document.getElementById.bind(document)
  public size = 40;
  public busy: string = '';
  constructor() {}
  newTile(
    id: string,
    clname: string,
    bkgrd: string,
    x: number,
    y: number,
    size: number
  ) {
    const el = document.createElement('div');
    el.id = id;
    el.className = clname;
    el.style.backgroundImage = "url('" + bkgrd + "')";
    el.style.top = `${y * size}px`;
    el.style.left = `${x * size}px`;
    return el;
  }
  checkMoveAvail(
    hbx1: number,
    hby1: number,
    hbx2: number,
    hby2: number,
    velo: number,
    gameBoard: number[][],
    size: number
  ) {
    if (
      ![2, 5, 6].includes(
        gameBoard[Math.round(hbx1 / size)][Math.round(hby1 / size)]
      ) ||
      ![2, 5, 6].includes(
        gameBoard[Math.round(hbx2 / size)][Math.round(hby2 / size)]
      )
    ) {
      return 'stay';
    } else {
      return velo;
    }
  }
  getNRandomFreePositions(
    amount: number,
    width: number,
    height: number
  ) {
    let count = amount;
    let pos: number[][] = [];
    while (count >= 0) {
      const x: number = Math.floor(Math.random() * (width - 1));
      const y: number = Math.floor(Math.random() * (height - 1));
      
      if ((y !== 0 &&
        y !== height - 1 &&
        x !== 0 &&
        x !== width - 1 &&
        (y % 2 !== 0 || x % 2 !== 0)) && x + y > 3 && !this.busy.includes(`${x},${y};`)) {
        pos.push([x, y]);
        this.busy += `${x},${y};`;
        count--;
      }
    }
    return pos;
  }
}
