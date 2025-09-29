var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Elements } from './elements.js';
import { Anim } from './engine.js';
import { Helper } from './helpers.js';
// @ts-ignore
import frameData from './data.json' with { type: "json" };
const elements = new Elements();
const helper = new Helper();
let gameBoard = [];
const dsplySize = helper.size;
let allSprites; // tablica z animacjami
let body;
let baloonCount;
let data;
let controller = [];
let exploding = false;
let isDead = false;
let baloonMover;
let desBrickCount = 0;
let movePlayer = false;
let currKey;
let moveInterval;
let powered = false;
let powUpPose;
let flamePoses = [];
let started = false;
let brickPoses;
let time = 0;
let timeCounter = 0;
let score = 0;
let img;
const nodes = ["0,1", "0,2", "0,3"];
let frameInterval = 0;
const modes = [
    { width: 21, height: 11, opp: 1 },
    { width: 21, height: 11, opp: 20 },
    { width: 21, height: 21, opp: 50 },
];
let currMode = 1;
let currKills = 0;
window.onload = () => {
    activateControls();
    initGame();
};
const initGame = () => {
    var _a;
    helper.id("end-screen").style.top = "-100%";
    time = 0;
    powered = false;
    started = false;
    isDead = false;
    (_a = helper.query("body")) === null || _a === void 0 ? void 0 : _a.classList.add("unstarted");
    document.documentElement.style.setProperty('--size', helper.size + "px");
    document.documentElement.style.setProperty('--gbwidth', modes[currMode].width.toString());
    document.documentElement.style.setProperty('--gbheight', modes[currMode].height.toString());
    baloonCount = modes[currMode].opp;
    helper.query('#killcount').innerHTML = `0/${modes[currMode].opp}`;
    helper.query('#app').innerHTML = `<div id="test"></div>`;
    body = helper.query('#test');
    data = frameData;
    img = new Image();
    img.src = '../img/sheet.png';
    gameBoard = [];
    createGameBoard(modes[currMode].width, modes[currMode].height);
    helper.busy = "";
    placeBricks(Math.ceil(modes[currMode].width * modes[currMode].height / 10));
    img.onload = () => {
        const modes = ["easy", "mid", "hard"];
        nodes.forEach((e, i) => {
            helper.id(e).innerHTML = `<p>${modes[i][0]}</p>`;
            helper.id(e).classList.add("modes");
            helper.id(e).onclick = () => modeChoice(i);
            i === currMode ? helper.id(e).classList.add("active") : null;
        });
        clearTimeout(frameInterval);
        clearInterval(baloonMover);
        clearInterval(moveInterval);
        spawnSprites();
        helper.id("starter").addEventListener("click", start);
    };
};
const modeChoice = (num) => {
    currMode = num;
    nodes.forEach((e) => helper.id(e).classList.remove("active"));
    helper.id("0," + (num + 1)).classList.add("active");
    initGame();
};
const spawnSprites = () => {
    const baloonPoses = helper.getNRandomFreePositions(baloonCount, modes[currMode].width, modes[currMode].height);
    let imgs = [];
    for (let i = 0; i < baloonCount; i++)
        imgs.push(new Anim(img, data.baloon, `baloon${i}`, baloonPoses[i], 'right', true));
    const player = new Anim(img, data.player, 'player', [1, 1], 'right', true);
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
};
const start = () => {
    var _a;
    if (!started) {
        (_a = helper.query("body")) === null || _a === void 0 ? void 0 : _a.classList.remove("unstarted");
        baloonMover = setInterval(() => {
            allSprites.baloons.forEach((e) => {
                ActivateBaloon(e, e.pos);
            });
        }, 1000);
        moveInterval = setInterval(allatPlayerMoveShi, 50);
        started = true;
        timeCounter = setInterval(() => time++, 1000);
    }
    else {
        initGame();
    }
};
const anim = () => {
    allSprites.bomb.moving ? allSprites.bomb.goAnim() : null;
    allSprites.player.goAnim();
    allSprites.baloons.forEach((e) => {
        if (!e.moving)
            allSprites.baloons.splice(allSprites.baloons.indexOf(e), 1);
        e.goAnim();
    });
    if (exploding) {
        let booms = 0;
        allSprites.flames.forEach((e) => {
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
    frameInterval = setTimeout(window.requestAnimationFrame, 1000 / 30, anim); // ~30 klatek/s
};
const createGameBoard = (w, h) => {
    for (let i = 0; i < h; i++) {
        const container = document.createElement('div');
        const tileTypes = [elements.grassUrl, elements.stoneUrl];
        container.className = 'container';
        gameBoard.push([]);
        for (let j = 0; j < w; j++) {
            const el = i === 0 ||
                i === h - 1 ||
                j === 0 ||
                j === w - 1 ||
                (i % 2 === 0 && j % 2 === 0)
                ? 3
                : 2;
            const field = helper.newTile(`${i},${j}`, 'field', tileTypes[el % 2], j, i, dsplySize);
            el === 3 ? field.classList.add('stone') : null;
            container.appendChild(field);
            gameBoard[i].push(el);
        }
        body.appendChild(container);
    }
};
const placeBricks = (n) => {
    brickPoses = helper.getNRandomFreePositions(n, modes[currMode].width, modes[currMode].height);
    powUpPose = brickPoses[Math.floor(Math.random() * n)];
    brickPoses.forEach((e) => {
        if (e[0] == powUpPose[0] && e[1] == powUpPose[1]) {
            console.log(powUpPose);
            const power = helper.newTile('power', 'sprite', elements.powerUrl, e[0], e[1], dsplySize);
            body.appendChild(power);
        }
        const brick = helper.newTile(`brick${e[1]},${e[0]}`, 'sprite', elements.brickUrl, e[0], e[1], dsplySize);
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
const handleBinds = (e) => {
    const prKey = e.which - 32;
    if (moveBinds.includes(prKey)) {
        //wasd
        currKey = prKey;
        controller.includes(currKey) ? null : controller.push(currKey);
        movePlayer = true;
    }
    else if (prKey == 90) {
        //z
        if (!exploding && !allSprites.bomb.moving && !isDead) {
            explode(allSprites.player.pos[0], allSprites.player.pos[1]);
        }
    }
};
const allatPlayerMoveShi = () => {
    if (movePlayer && started && !isDead) {
        let xyMove = [0, 0];
        const velocity = Math.round(dsplySize / 9);
        let directions = ['left', 'up', 'right', 'down'];
        const hb = allSprites.player.hitbox;
        controller.forEach((key) => {
            let temp;
            switch (key) {
                case moveBinds[0]:
                    temp = helper.checkMoveAvail(hb.lt[1], hb.lt[0] - 2 * velocity, hb.lb[1], hb.lb[0] - 2 * velocity, -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[0] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[1]:
                    temp = helper.checkMoveAvail(hb.lt[1] - 2 * velocity, hb.lt[0], hb.rt[1] - 2 * velocity, hb.rt[0], -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[1] = temp;
                    else
                        xyMove[1] = temp;
                    break;
                case moveBinds[2]:
                    temp = helper.checkMoveAvail(hb.rt[1], hb.rt[0] + velocity, hb.rb[1], hb.rb[0] + velocity, velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[2] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[3]:
                    temp = helper.checkMoveAvail(hb.lb[1] + velocity, hb.lb[0], hb.rb[1] + velocity, hb.rb[0], velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[3] = temp;
                    else
                        xyMove[1] = temp;
                    break;
            }
        });
        allSprites.player.moving = true;
        allSprites.player.movePlayer(directions[moveBinds.indexOf(currKey)], xyMove);
        allSprites.baloons.forEach((e) => {
            if (e.pos[0] === allSprites.player.pos[0] &&
                e.pos[1] === allSprites.player.pos[1]) {
                killPlayer();
            }
            else if (gameBoard[allSprites.player.pos[1]][allSprites.player.pos[0]] == 5) {
                killPlayer();
            }
        });
        if (powUpPose[0] === allSprites.player.pos[0] &&
            powUpPose[1] === allSprites.player.pos[1]) {
            helper.id('power').style.display = 'none';
            helper.id('player').style.filter = 'hue-rotate(163deg) drop-shadow(0px 0px 20px orange)';
            helper.id('player').style.animation = 'power infinite 1s ease-in-out';
            powUpPose = [0, 0];
            powered = true;
        }
    }
};
const ActivateBaloon = (baloon, pos) => {
    const obj = {
        left: gameBoard[pos[1]][pos[0] - 1] === 2 ? true : false,
        up: gameBoard[pos[1] - 1][pos[0]] === 2 ? true : false,
        right: gameBoard[pos[1]][pos[0] + 1] === 2 ? true : false,
        down: gameBoard[pos[1] + 1][pos[0]] === 2 ? true : false,
    };
    baloon.moveBaloon(obj);
    if (baloon.pos[0] === allSprites.player.pos[0] &&
        baloon.pos[1] === allSprites.player.pos[1]) {
        killPlayer();
    }
};
const explode = (x, y) => __awaiter(void 0, void 0, void 0, function* () {
    currKills = 0;
    allSprites.bomb.moving = true;
    allSprites.bomb.goTo(x, y);
    gameBoard[y][x] = 6;
    yield new Promise((e) => setTimeout(e, 2500));
    console.log(gameBoard[y][x]);
    tileExplosion(x, y, 4);
    if (powered) {
        if (tileExplosion(x - 1, y, 5))
            tileExplosion(x - 2, y, 0);
        if (tileExplosion(x, y - 1, 6))
            tileExplosion(x, y - 2, 1);
        if (tileExplosion(x + 1, y, 7))
            tileExplosion(x + 2, y, 2);
        if (tileExplosion(x, y + 1, 8))
            tileExplosion(x, y + 2, 3);
    }
    else {
        tileExplosion(x - 1, y, 0);
        tileExplosion(x, y - 1, 1);
        tileExplosion(x + 1, y, 2);
        tileExplosion(x, y + 1, 3);
    }
    clearFlames();
    exploding = true;
});
const tileExplosion = (x, y, i) => {
    if (gameBoard[y][x] !== 3 && x > 0 && y > 0 && x < modes[currMode].width && y < modes[currMode].height) {
        if (gameBoard[y][x] == 4) {
            helper.id(`brick${y},${x}`).style.display = 'none';
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
        allSprites.baloons.forEach((e) => {
            if (e.pos[0] == x && e.pos[1] == y) {
                killBaloon(e);
            }
        });
        gameBoard[y][x] = 5;
    }
    return gameBoard[y][x] !== 3;
};
const clearFlames = () => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((r) => setTimeout(r, 700));
    flamePoses.forEach((e) => {
        gameBoard[e[1]][e[0]] = 2;
    });
    flamePoses = [];
});
const killPlayer = () => {
    isDead = true;
    allSprites.player.moving = false;
    allSprites.player.vanish();
    allSprites.dead.el.style.top = allSprites.player.el.style.top;
    allSprites.dead.el.style.left = allSprites.player.el.style.left;
    allSprites.dead.el.style.opacity = "100%";
    allSprites.dead.moving = true;
    clearInterval(baloonMover);
    clearInterval(moveInterval);
    endGame();
};
const killBaloon = (e) => __awaiter(void 0, void 0, void 0, function* () {
    currKills++;
    baloonCount--;
    e.currDir = 'dead';
    e.actFrame = 0;
    e.repeat = false;
    helper.query('#killcount').innerHTML = `${modes[currMode].opp - baloonCount}/${modes[currMode].opp}`;
    score += currKills * 50;
    if (baloonCount == 0)
        endGame();
    switch (currKills) {
        case 1:
            break;
        case 2:
            comment("dk", e);
            break;
        case 3:
            comment("tk", e);
            break;
        case 4:
            comment("qk", e);
            break;
        default:
            comment("ik", e);
    }
});
const comment = (what, e) => {
    helper.id(what).classList.remove("off");
    helper.id(what).style.top = e.el.style.top;
    helper.id(what).style.left = e.el.style.left;
    setTimeout(() => {
        helper.id(what).classList.add("off");
        helper.id(what).style.top = "0";
    }, 2000);
};
const endGame = () => {
    helper.id("end-screen").style.top = "50%";
    clearInterval(timeCounter);
    if (!isDead) {
        helper.query("#img").src = "img/bombergif.gif";
        helper.id("result").innerHTML = "congrats";
    }
    else {
        helper.query("#img").src = "img/baloongif.gif";
        helper.id("result").innerHTML = "get good";
    }
    helper.id("time").innerHTML = `${time.toString()}s`;
    helper.id("score").innerHTML = score.toString();
    helper.id("powered").innerHTML = powered ? "yes" : "no";
    // helper.id("test")!.style.filter = "brightness(50%)"
};
