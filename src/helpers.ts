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
  setupPrettyStuff(currMode:number, modes: { opp:number; width:number; height:number }[]) {
    const colors = ["green", "#5c8000", "#806400"]
    const filters = ["", "sepia(.5)", "sepia(.5) hue-rotate(320deg) brightness(0.7) saturate(2.5)"]
    
    this.id("lvl")!.innerHTML = `1`
    this.query<HTMLElement>(".title1")!.style.opacity = "1"
    this.query<HTMLElement>(".title2")!.style.opacity = "1"
    this.id("starter")!.innerHTML = "START"
    this.id("controls")!.style.opacity = "100%"
    this.id("end-screen")!.style.top = "-100%";
    this.id("score")!.innerHTML = `0`
    this.id("time")!.innerHTML = `0s`
    this.query("body")!.classList.add("unstarted")
    document.documentElement.style.setProperty('--size', this.size + "px");
    document.documentElement.style.setProperty('--gbwidth', modes[currMode].width.toString());
    document.documentElement.style.setProperty('--gbheight', modes[currMode].height.toString());
    document.documentElement.style.setProperty('--mode', colors[currMode]);
    document.documentElement.style.setProperty('--filter', filters[currMode]);
    this.query('#killcount')!.innerHTML = `0/${modes[currMode].opp}`;
    this.query('#test')!.innerHTML = ``;
    this.query('#sprites')!.innerHTML = ``;
    this.id("app")!.style.transform = "scale(1) translateY(calc(var(--size) * 10 / 2 * -1))"
    this.id("app")!.style.opacity = "1"
    this.id("test")!.style.transform = `translate(0,0)`
    this.query<HTMLElement>(".title1")!.style.color = "aqua"
    this.query<HTMLElement>(".title2")!.style.color = "orange"
    this.query<HTMLElement>(".title1")!.style.background = "url(/img/intro.gif)"
    this.query<HTMLElement>(".title2")!.style.background = "url(/img/intro.gif)"
    this.id("loading")!.style.opacity = "0"
    setTimeout(() => {
      this.id("loading")!.style.display = "none"
      this.query<HTMLElement>(".title1")!.style.background = "transparent"
      this.query<HTMLElement>(".title2")!.style.background = "transparent"
      this.query<HTMLElement>(".title1")!.style.textShadow = "5px 5px 0px teal"
      this.query<HTMLElement>(".title2")!.style.textShadow = "5px 5px 0px darkred"
    }, 1000);
  }
}
