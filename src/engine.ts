import { Helper } from './helpers.js';
const helper = new Helper()
const dsplySize = helper.size;
const canSize = 16;

export class Anim {
  private img: CanvasImageSource;
  private tickNumber: number;
  private destId: string;
  private frames: object[];
  private times: number[];
  public actFrame: number;
  public repeat: boolean;
  public pos: number[];
  public currDir: string;
  public moving: boolean;
  private currMove;
  public el;
  protected skin = 0;
  constructor(
    img: CanvasImageSource,
    ob: { frames: any; times: any; repeat: any },
    destId: string,
    pos: number[],
    currDir: string,
    moving: boolean
  ) {
    this.img = img; // spritesheet
    this.tickNumber = 0; // aktualny tick
    this.actFrame = 0; // aktualnie renderowana klatka
    this.destId = destId;
    this.pos = pos;
    this.currDir = currDir;
    this.moving = moving;
    this.frames = ob.frames; // tablica z klatkami
    this.times = ob.times; // tablica z czasami wyświetleń klatki
    this.repeat = ob.repeat; // czy animacja ma się powtarzać

    this.el = document.createElement('canvas');
    this.el.width = canSize;
    this.el.height = canSize;
    this.el.id = this.destId;
    this.el.className = !this.el.className
      ? this.destId[0] === 'e'
        ? 'explosion'
        : 'sprite'
      : this.el.className;
    document.getElementById('test')!.appendChild(this.el);
    this.currMove = this.frames[this.currDir];
    this.goTo(pos[0], pos[1]);
  }

  renderFrame(i: number, dir: string) {
    if (this.moving) {
      let ctx: CanvasRenderingContext2D = this.el.getContext('2d')!;
      ctx.reset();
      this.currMove = this.frames[dir];
      ctx.drawImage(
        this.img,
        this.currMove[i].x0,
        this.currMove[i].y0 + this.skin * 16,
        canSize,
        canSize,
        0,
        0,
        canSize,
        canSize
      );
    }
  }

  goTo(x: number, y: number) {
    const el: HTMLElement = document.getElementById(y + ',' + x)!;
    this.el.style.top = el.style.top;
    this.el.style.left = el.style.left;
    this.pos = [x, y];
  }

  goAnim() {
    this.renderFrame(this.actFrame, this.currDir);
    this.tickNumber++;
    if (this.tickNumber == this.times[this.actFrame]) {
      // rotacja klatek
      this.tickNumber = 0;
      this.actFrame++;
    }
    if (this.repeat && this.actFrame == this.currMove.length) {
      this.actFrame = 0;
    } else if (!this.repeat && this.actFrame == this.currMove.length) {
      this.el.style.backgroundImage = 'none';
      this.moving = false;
      this.actFrame = 0;
      this.vanish()
    }
  }
  vanish() {
    this.el.remove()
  }
}

export class AnimBaloon extends Anim {
  constructor(img: CanvasImageSource, ob: { frames: any; times: any; repeat: any }, id: string, pos: number[], currDir: string) {
    super(img, ob, id, pos, currDir, true);
    this.skin = Math.floor(Math.random() * 6)
    this.currDir = Math.random() >= 0.5 ? 'right' : 'left';
    this.el.className = 'baloon';
  }
  moveBaloon(obj: object) {
    if (this.repeat) {
      const dirs = ['left', 'up', 'right', 'down'];
      if (obj[this.currDir]) {
        this.goTo(
          this.pos[0] +
            (this.currDir === 'left' ? -1 : this.currDir === 'right' ? 1 : 0),
          this.pos[1] +
            (this.currDir === 'up' ? -1 : this.currDir === 'down' ? 1 : 0)
        );
      } else {
        this.currDir = dirs[Math.round(Math.random() * 3)];
        return;
      }
      if (Math.random() >= 0.8) {
        this.currDir = dirs[Math.round(Math.random() * 3)];
      }
    }
  }
}

export class AnimPlayer extends Anim {
  hitbox?: object;
  constructor(img: CanvasImageSource, ob: { frames: any; times: any; repeat: any }, pos: number[], currDir: string) {
    super(img, ob, 'player', pos, currDir, true);
    this.hitbox = {
      lt: [pos[0] * (dsplySize / 2), pos[1] * (dsplySize / 2)],
      rt: [(pos[0] + 1) * (dsplySize / 2), pos[1] * (dsplySize / 2)],
      lb: [pos[0] * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
      rb: [(pos[0] + 1) * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
    };
  }
  movePlayer(dir: string, xyMove: number[]) {
    let left = parseInt(this.el.style.left.substring(0, this.el.style.left.length - 2));
    let top = parseInt(this.el.style.top.substring(0, this.el.style.top.length - 2));
    left = left + xyMove[0];
    top = top + xyMove[1];
    this.el.style.left = left + 'px';
    this.el.style.top = top + 'px';
    helper.id("test")!.style.transform = `translate(calc(50% - ${helper.size}px - ${left}px),${-top}px)`
    dir !== 'stay' ? (this.currDir = dir) : null;
    this.pos = [
      Math.round((left + 14) / dsplySize),
      Math.round((top + 14) / dsplySize),
    ];
    this.hitbox = {
      lt: [left, top],
      rt: [left + dsplySize / 2, top],
      lb: [left, top + dsplySize / 1.3],
      rb: [left + dsplySize / 2, top + dsplySize / 1.3],
    };
  }
  goTo(x: number, y: number) {
    this.el.style.top = dsplySize * y + 'px';
    this.el.style.left = dsplySize * x + 'px';
    this.pos = [x,y]
  }
}
