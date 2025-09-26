// import { Game } from './game';

// const game = new Game();

import { Elements } from './elements.js';
import { Anim } from './engine.js';
import { Helper } from './helpers.js';
// @ts-ignore
import frameData from './data.json' with {type:"json"};

const elements = new Elements();
const helper = new Helper();
let gameBoard: number[][] = [];
const height: number = 11;
const width: number = 21;
const dsplySize: number = helper.size;
let allSprites: {
  baloons: any;
  bomb: any;
  player: any;
  flames: any;
  desBrick: any;
  dead: any;
}; // tablica z animacjami
let body: HTMLElement;
let baloonCount: number = 10;
let data: {
  baloon: { frames: any; times: any; repeat: any };
  player: { frames: any; times: any; repeat: any };
  bomb: { frames: any; times: any; repeat: any };
  explosion: { frames: any; times: any; repeat: any };
  dead_player: { frames: any; times: any; repeat: any };
  brick_des: { frames: any; times: any; repeat: any };
};
let controller: number[] = [];
let exploding = false;
let isDead = false;
let baloonMover: number;
let desBrickCount = 0;
let movePlayer = false;
let currKey: number;
let moveInterval: number;
let powered = false;
let powUpPose: number[];
let flamePoses: number[][] = [];
let started = false
let frameTimeOut: number

window.onload = () => {
  initGame()
};

const initGame = () => {
  document.querySelector<HTMLDivElement>(
    '#app'
  )!.innerHTML = `<div id="test"></div>`;
  body = document.querySelector('#test')!;
  data = frameData;
  let img = new Image();
  img.src = '../img/sheet.png';
  createGameBoard(width, height);
  placeBricks(width);
  const baloonPoses: number[][] = helper.getNRandomFreePositions(
    baloonCount,
    width,
    height,
    gameBoard
  );
  img.onload = function () {
    let imgs: Anim[] = [];
    for (let i = 0; i < baloonCount; i++) {
      imgs.push(
        new Anim(img, data.baloon, `baloon${i}`, baloonPoses[i], 'right', true)
      );
    }
    const player: Anim = new Anim(
      img,
      data.player,
      'player',
      [1, 1],
      'right',
      true
    );
    player.renderFrame(0, 'down');
    player.moving = false;
    allSprites = {
      player: player,
      baloons: imgs,
      bomb: new Anim(img, data.bomb, 'bomb', [0, 0], 'right', false),
      flames: [
        new Anim(img, data.explosion, `explosion1`, [0, 0], 'left', false),
        new Anim(img, data.explosion, `explosion2`, [0, 0], 'top', false),
        new Anim(img, data.explosion, `explosion3`, [0, 0], 'right', false),
        new Anim(img, data.explosion, `explosion4`, [0, 0], 'down', false),
        new Anim(img, data.explosion, `explosion5`, [0, 0], 'middle', false),
        new Anim(img, data.explosion, `explosion6`, [0, 0], 'midleft', false),
        new Anim(img, data.explosion, `explosion7`, [0, 0], 'midtop', false),
        new Anim(img, data.explosion, `explosion8`, [0, 0], 'midright', false),
        new Anim(img, data.explosion, `explosion9`, [0, 0], 'middown', false),
      ],
      dead: new Anim(img, data.dead_player, 'dead_guy', [0, 0], 'right', false),
      desBrick: [
        new Anim(img, data.brick_des, `desbrick1`, [0, 0], 'right', false),
        new Anim(img, data.brick_des, `desbrick2`, [0, 0], 'right', false),
        new Anim(img, data.brick_des, `desbrick3`, [0, 0], 'right', false),
        new Anim(img, data.brick_des, `desbrick4`, [0, 0], 'right', false),
      ],
    };
    anim();
    document.getElementById("starter")!.addEventListener("click", start)
  };
}

const start = () => {
  if (!started) {
    document.querySelector("body")?.classList.remove("unstarted")
    activateControls();
    baloonMover = setInterval(() => {
      allSprites.baloons.forEach((e: Anim) => {
        ActivateBaloon(e, e.pos);
      });
    }, 1000);
    moveInterval = setInterval(allatPlayerMoveShi, 50);
    started = true
  } else {
    removeEventListener('keypress', handleBinds);
    clearInterval(baloonMover);
    clearInterval(moveInterval);
    clearTimeout(frameTimeOut)
    document.querySelector("body")!.classList.add("unstarted")
    gameBoard = []
    initGame()
    started = false
  }
}

const anim = () => {
  allSprites.bomb.moving ? allSprites.bomb.goAnim() : null;
  allSprites.player.goAnim();
  allSprites.baloons.forEach((e: { moving: any; goAnim: () => void }) => {
    if (!e.moving) {
      allSprites.baloons.splice(allSprites.baloons.indexOf(e), 1);
      baloonCount--;
    }
    e.goAnim();
  });
  if (exploding) {
    let booms = 0;
    allSprites.flames.forEach((e: { goAnim: () => void; moving: boolean }) => {
      e.goAnim();
      e.moving === true ? booms++ : null;
    });
    exploding = booms === 0 ? false : true;
  }
  for (let i = 0; i < desBrickCount; i++) {
    if (!allSprites.desBrick[i].moving) {
      desBrickCount = 0;
      break;
    }
    allSprites.desBrick[i].goAnim();
  }
  isDead ? allSprites.dead.goAnim() : null;
  frameTimeOut = setTimeout(window.requestAnimationFrame, 1000 / 30, anim); // ~30 klatek/s
};

const createGameBoard = (w: number, h: number) => {
  for (let i = 0; i < h; i++) {
    const container: HTMLElement = document.createElement('div');
    const tileTypes: string[] = [elements.grassUrl!, elements.stoneUrl!];
    container.className = 'container';
    gameBoard.push([]);
    for (let j = 0; j < w; j++) {
      const el =
        i === 0 ||
        i === h - 1 ||
        j === 0 ||
        j === w - 1 ||
        (i % 2 === 0 && j % 2 === 0)
          ? 3
          : 2;
      const field: HTMLElement = helper.newTile(
        `${i},${j}`,
        'field',
        tileTypes[el % 2],
        j,
        i,
        dsplySize
      );
      el === 3 ? field.classList.add('stone') : null;
      container.appendChild(field);
      gameBoard[i].push(el);
    }
    body.appendChild(container);
  }
};

const placeBricks = (n: number) => {
  const poses = helper.getNRandomFreePositions(n, width, height, gameBoard);
  powUpPose = poses[Math.floor(Math.random() * n)];
  poses.forEach((e) => {
    if (e[0] == powUpPose[0] && e[1] == powUpPose[1]) {
      console.log(powUpPose);
      const power: HTMLElement = helper.newTile(
        'power',
        'sprite',
        elements.powerUrl!,
        e[0],
        e[1],
        dsplySize
      );
      body.appendChild(power);
    }
    const brick: HTMLElement = helper.newTile(
      `brick${e[1]},${e[0]}`,
      'sprite',
      elements.brickUrl!,
      e[0],
      e[1],
      dsplySize
    );
    gameBoard[e[1]][e[0]] = 4;
    body.appendChild(brick);
  });
};

const moveBinds = [65, 87, 68, 83];
const activateControls = () => {
  addEventListener('keypress', handleBinds);
  addEventListener('keyup', (e) => {
    if (moveBinds.includes(e.which)) {
      controller.splice(controller.indexOf(e.which), 1);
      if (controller.length == 0) {
        movePlayer = false;
      }
      allSprites.player.moving = false;
    }
  });
};

const handleBinds = (e: KeyboardEvent) => {
  const prKey = e.which - 32;
  if (moveBinds.includes(prKey)) {
    //wasd
    currKey = prKey;
    controller.includes(currKey) ? null : controller.push(currKey);
    movePlayer = true;
  } else if (prKey == 90) {
    //z
    if (!exploding && !allSprites.bomb.moving) {
      explode(allSprites.player.pos[0], allSprites.player.pos[1]);
    }
  }
};

const allatPlayerMoveShi = () => {
  if (movePlayer) {
    let xyMove: number[] = [0, 0];
    const velocity = Math.round(dsplySize / 9);
    let directions: string[] = ['left', 'up', 'right', 'down'];
    const hb = allSprites.player.hitbox!;
    controller.forEach((key) => {
      let temp: string | number;
      switch (key) {
        case moveBinds[0]:
          temp = helper.checkMoveAvail(
            hb.lt[1],
            hb.lt[0] - 2 * velocity,
            hb.lb[1],
            hb.lb[0] - 2 * velocity,
            -velocity,
            gameBoard,
            dsplySize
          );
          if (typeof temp === 'string') directions[0] = temp;
          else xyMove[0] = temp;
          break;
        case moveBinds[1]:
          temp = helper.checkMoveAvail(
            hb.lt[1] - 2 * velocity,
            hb.lt[0],
            hb.rt[1] - 2 * velocity,
            hb.rt[0],
            -velocity,
            gameBoard,
            dsplySize
          );
          if (typeof temp === 'string') directions[1] = temp;
          else xyMove[1] = temp;
          break;
        case moveBinds[2]:
          temp = helper.checkMoveAvail(
            hb.rt[1],
            hb.rt[0] + velocity,
            hb.rb[1],
            hb.rb[0] + velocity,
            velocity,
            gameBoard,
            dsplySize
          );
          if (typeof temp === 'string') directions[2] = temp;
          else xyMove[0] = temp;
          break;
        case moveBinds[3]:
          temp = helper.checkMoveAvail(
            hb.lb[1] + velocity,
            hb.lb[0],
            hb.rb[1] + velocity,
            hb.rb[0],
            velocity,
            gameBoard,
            dsplySize
          );
          if (typeof temp === 'string') directions[3] = temp;
          else xyMove[1] = temp;
          break;
      }
    });
    allSprites.player.moving = true;
    allSprites.player.movePlayer(
      directions[moveBinds.indexOf(currKey)],
      xyMove
    );
    allSprites.baloons.forEach((e: { pos: any[] }) => {
      if (
        e.pos[0] === allSprites.player.pos[0] &&
        e.pos[1] === allSprites.player.pos[1]
      ) {
        killPlayer();
      } else if (
        gameBoard[allSprites.player.pos[1]][allSprites.player.pos[0]] == 5
      ) {
        killPlayer();
      }
    });
    if (
      powUpPose[0] === allSprites.player.pos[0] &&
      powUpPose[1] === allSprites.player.pos[1]
    ) {
      document.getElementById('power')!.style.display = 'none';
      document.getElementById('player')!.style.filter = 'hue-rotate(163deg) drop-shadow(0px 0px 20px orange)';
      powUpPose = [0, 0];
      powered = true;
    }
  }
};

const ActivateBaloon = (baloon: Anim, pos: number[]) => {
  const obj = {
    left: gameBoard[pos[1]][pos[0] - 1] === 2 ? true : false,
    up: gameBoard[pos[1] - 1][pos[0]] === 2 ? true : false,
    right: gameBoard[pos[1]][pos[0] + 1] === 2 ? true : false,
    down: gameBoard[pos[1] + 1][pos[0]] === 2 ? true : false,
  };
  baloon.moveBaloon(obj);
  if (
    baloon.pos[0] === allSprites.player.pos[0] &&
    baloon.pos[1] === allSprites.player.pos[1]
  ) {
    killPlayer();
  }
};

const explode = async (x: number, y: number) => {
  allSprites.bomb.moving = true;
  allSprites.bomb.goTo(x, y);
  gameBoard[y][x] = 6;
  await new Promise((e) => setTimeout(e, 2500));
  console.log(gameBoard[y][x]);
  tileExplosion(x, y, 4);
  if (powered) {
    if (tileExplosion(x - 1, y, 5)) tileExplosion(x - 2, y, 0);
    if (tileExplosion(x, y - 1, 6)) tileExplosion(x, y - 2, 1);
    if (tileExplosion(x + 1, y, 7)) tileExplosion(x + 2, y, 2);
    if (tileExplosion(x, y + 1, 8)) tileExplosion(x, y + 2, 3);
  } else {
    tileExplosion(x - 1, y, 0);
    tileExplosion(x, y - 1, 1);
    tileExplosion(x + 1, y, 2);
    tileExplosion(x, y + 1, 3);
  }
  clearFlames();
  exploding = true;
};

const tileExplosion = (x: number, y: number, i: number) => {
  if (gameBoard[y][x] !== 3 && x > 0 && y > 0 && x < width && y < height) {
    if (gameBoard[y][x] == 4) {
      document.getElementById(`brick${y},${x}`)!.style.display = 'none';
      gameBoard[y][x] = 2;
      allSprites.desBrick[desBrickCount].goTo(x, y);
      allSprites.desBrick[desBrickCount].moving = true;
      desBrickCount++;
    }
    allSprites.flames[i].goTo(x, y);
    flamePoses.push([x, y]);
    allSprites.flames[i].moving = true;
    if (allSprites.player.pos[0] == x && allSprites.player.pos[1] == y) {
      killPlayer();
    }
    allSprites.baloons.forEach((e: Anim) => {
      if (e.pos[0] == x && e.pos[1] == y) {
        killBaloon(e);
      }
    });
    gameBoard[y][x] = 5;
  }
  return gameBoard[y][x] !== 3;
};

const clearFlames = async () => {
  await new Promise((r) => setTimeout(r, 700));
  flamePoses.forEach((e) => {
    gameBoard[e[1]][e[0]] = 2;
  });
  flamePoses = [];
};

const killPlayer = () => {
  isDead = true;
  allSprites.player.moving = false;
  allSprites.player.vanish();
  allSprites.dead.el.style.top = allSprites.player.el.style.top;
  allSprites.dead.el.style.left = allSprites.player.el.style.left;
  allSprites.dead.el.style.opacity = "100%";
  allSprites.dead.moving = true;
  removeEventListener('keypress', handleBinds);
  clearInterval(baloonMover);
  clearInterval(moveInterval);
};

const killBaloon = async (e: Anim) => {
  e.currDir = 'dead';
  e.actFrame = 0;
  e.repeat = false;
};
