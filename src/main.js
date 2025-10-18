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
const help = new Helper();
let gameBoard = [];
const dsplySize = help.size;
let allSprites; // tablica z animacjami
let body;
let baloonCount;
let data;
let controller = [];
let isDead = false;
let baloonMover;
let desBrickCount = 0;
let movePlayer = false;
let currKey;
let moveInterval;
let powUpPoses = [];
let flamePoses = [];
let started = false;
let brickPoses;
let time = 0;
let timeCounter = 0;
let score = 0;
let img;
const nodes = ["0,9", "0,10", "0,11"];
let frameInterval = 0;
const modes = [
    { width: 21, height: 9, opp: 10 },
    { width: 21, height: 11, opp: 20 },
    { width: 21, height: 21, opp: 50 },
];
let currMode = 0;
let currKills = 0;
const velocity = dsplySize / 8;
let mobileOn = false;
let bombUp = 0;
let flameCount = 0;
let bombCount = 0;
window.onload = () => {
    window.addEventListener("contextmenu", e => e.preventDefault());
    activateControls();
    initGame();
    setupStyles();
};
const setupStyles = () => {
    help.id("app").style.transform = "scale(1) translateY(calc(var(--size) * 10 / 2 * -1))";
    help.id("app").style.opacity = "1";
    help.query(".title1").style.color = "aqua";
    help.query(".title2").style.color = "orange";
    help.query(".title1").style.background = "url(/img/intro.gif)";
    help.query(".title2").style.background = "url(/img/intro.gif)";
    setTimeout(() => {
        help.query(".title1").style.background = "transparent";
        help.query(".title2").style.background = "transparent";
        help.query(".title1").style.textShadow = "5px 5px 0px teal";
        help.query(".title2").style.textShadow = "5px 5px 0px darkred";
    }, 1000);
};
const initGame = () => {
    help.id("starter").innerHTML = "START";
    help.id("controls").style.opacity = "100%";
    help.id("end-screen").style.top = "-100%";
    time = 0;
    score = 0;
    help.id("score").innerHTML = `0`;
    help.id("time").innerHTML = `0s`;
    started = false;
    isDead = false;
    const colors = ["green", "#5c8000", "#806400"];
    help.query("body").classList.add("unstarted");
    document.documentElement.style.setProperty('--size', help.size + "px");
    document.documentElement.style.setProperty('--gbwidth', modes[currMode].width.toString());
    document.documentElement.style.setProperty('--gbheight', modes[currMode].height.toString());
    document.documentElement.style.setProperty('--mode', colors[currMode]);
    baloonCount = modes[currMode].opp;
    help.query('#killcount').innerHTML = `0/${modes[currMode].opp}`;
    help.query('#test').innerHTML = ``;
    help.query('#sprites').innerHTML = ``;
    body = help.query('#test');
    data = frameData;
    img = new Image();
    img.src = '../img/sheet.png';
    gameBoard = [];
    createGameBoard(modes[currMode].width, modes[currMode].height);
    help.busy = "";
    placeBricks(Math.ceil(modes[currMode].width * modes[currMode].height / 10));
    img.onload = () => {
        const modes = ["easy", "mid", "hard"];
        nodes.forEach((e, i) => {
            help.id(e).innerHTML = `<p>${modes[i][0]}</p>`;
            help.id(e).classList.add("modes");
            help.id(e).onclick = () => modeChoice(i);
            i === currMode ? help.id(e).classList.add("active") : null;
        });
        help.id("wasd").addEventListener("click", () => mobileControls());
        clearTimeout(frameInterval);
        clearInterval(baloonMover);
        clearInterval(moveInterval);
        clearInterval(timeCounter);
        spawnSprites();
        help.id("starter").addEventListener("click", start);
    };
};
const modeChoice = (num) => {
    currMode = num;
    nodes.forEach((e) => help.id(e).classList.remove("active"));
    help.id("0," + (num + 1)).classList.add("active");
    initGame();
};
const spawnSprites = () => {
    const baloonPoses = help.getNRandomFreePositions(baloonCount, modes[currMode].width, modes[currMode].height);
    let imgs = [];
    for (let i = 0; i < baloonCount; i++)
        imgs.push(new Anim(img, data.baloon, `baloon${i}`, baloonPoses[i], 'right', true));
    const player = new Anim(img, data.player, 'player', [1, 1], 'right', true);
    player.renderFrame(0, 'down');
    player.moving = false;
    allSprites = {
        player: player,
        baloons: imgs,
        bomb: [],
        flames: [],
        dead: new Anim(img, data.dead_player, 'dead_guy', [0, 0], 'right', false),
        desBrick: [],
    };
    anim();
};
const start = () => {
    if (!started) {
        help.id("starter").innerHTML = "RESTART";
        help.query("body").classList.remove("unstarted");
        help.id("controls").style.opacity = "50%";
        baloonMover = setInterval(() => allSprites.baloons.forEach((e) => ActivateBaloon(e, e.pos)), 1000);
        moveInterval = setInterval(allatPlayerMoveShi, 50);
        started = true;
        timeCounter = setInterval(() => {
            time++;
            help.id("time").innerHTML = `${time.toString()}s`;
        }, 1000);
        anim();
    }
    else
        initGame();
};
const anim = () => {
    allSprites.bomb.forEach((b) => b.goAnim());
    allSprites.desBrick.forEach((d, i) => {
        if (d.moving)
            d.goAnim();
        else {
            allSprites.desBrick[i].vanish();
            allSprites.desBrick.splice(i, 1);
            desBrickCount--;
        }
    });
    allSprites.flames.forEach((f) => f.goAnim());
    allSprites.player.goAnim();
    allSprites.baloons.forEach((e) => {
        if (!e.moving)
            allSprites.baloons.splice(allSprites.baloons.indexOf(e), 1);
        e.goAnim();
    });
    isDead ? allSprites.dead.goAnim() : null;
    frameInterval = started ? setTimeout(window.requestAnimationFrame, 1000 / 30, anim) : 0; // ~30 klatek/s
};
const createGameBoard = (w, h) => {
    for (let i = 0; i < h; i++) {
        const container = document.createElement('div');
        const tileTypes = ["", elements.stoneUrl];
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
            const field = help.newTile(`${i},${j}`, 'field', tileTypes[el % 2], j, i, dsplySize);
            el === 3 ? field.classList.add('stone') : null;
            container.appendChild(field);
            gameBoard[i].push(el);
        }
        body.appendChild(container);
    }
};
const placeBricks = (n) => {
    brickPoses = help.getNRandomFreePositions(n, modes[currMode].width, modes[currMode].height);
    for (let i = 0; i < Math.floor(brickPoses.length / 2); i++)
        powUpPoses.push(brickPoses[Math.floor(Math.random() * n)]);
    powUpPoses.forEach((p, i) => {
        const power = help.newTile(`power${i}`, 'sprite', elements.powerUrl, p[0], p[1], dsplySize);
        body.appendChild(power);
    });
    brickPoses.forEach((e) => {
        const brick = help.newTile(`brick${e[1]},${e[0]}`, 'sprite', elements.brickUrl, e[0], e[1], dsplySize);
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
    if (moveBinds.includes(prKey)) { //wasd
        currKey = prKey;
        controller.includes(currKey) ? null : controller.push(currKey);
        movePlayer = true;
    }
    else if (prKey == 90)
        bombBind(); //z
};
const bombBind = () => {
    if (!isDead && started)
        explode(allSprites.player.pos[0], allSprites.player.pos[1]);
};
const allatPlayerMoveShi = () => {
    if (movePlayer && started && !isDead) {
        let xyMove = [0, 0];
        let directions = ['left', 'up', 'right', 'down'];
        const hb = allSprites.player.hitbox;
        controller.forEach((key) => {
            let temp;
            switch (key) {
                case moveBinds[0]:
                    temp = help.checkMoveAvail(hb.lt[1], hb.lt[0] - 2 * velocity, hb.lb[1], hb.lb[0] - 2 * velocity, -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[0] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[1]:
                    temp = help.checkMoveAvail(hb.lt[1] - 2 * velocity, hb.lt[0], hb.rt[1] - 2 * velocity, hb.rt[0], -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[1] = temp;
                    else
                        xyMove[1] = temp;
                    break;
                case moveBinds[2]:
                    temp = help.checkMoveAvail(hb.rt[1], hb.rt[0] + velocity, hb.rb[1], hb.rb[0] + velocity, velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[2] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[3]:
                    temp = help.checkMoveAvail(hb.lb[1] + velocity, hb.lb[0], hb.rb[1] + velocity, hb.rb[0], velocity, gameBoard, dsplySize);
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
                e.pos[1] === allSprites.player.pos[1])
                killPlayer();
            else if (gameBoard[allSprites.player.pos[1]][allSprites.player.pos[0]] == 5)
                killPlayer();
        });
        powUpPoses.forEach((p, i) => {
            if (p[0] === allSprites.player.pos[0] &&
                p[1] === allSprites.player.pos[1]) {
                help.id(`power${i}`).style.display = 'none';
                powUpPoses[i] = [0, 0];
                bombUp++;
                console.log(bombUp);
            }
        });
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
        baloon.pos[1] === allSprites.player.pos[1])
        killPlayer();
};
const explode = (x, y) => __awaiter(void 0, void 0, void 0, function* () {
    if (gameBoard[y][x] != 6 && gameBoard[y][x] != 5) {
        currKills = 0;
        bombCount++;
        allSprites.bomb.push(new Anim(img, data.bomb, `bomb${bombCount}`, [x, y], "right", true));
        gameBoard[y][x] = 6;
        yield new Promise((e) => setTimeout(e, 2500));
        allSprites.bomb[0].vanish();
        allSprites.bomb.splice(0, 1);
        bombCount--;
        const flameStart = allSprites.flames.length;
        tileExplosion(x, y, 0);
        let bombSurround = [[x, y], [x, y], [x, y], [x, y]];
        for (let i = 0; i <= bombUp; i++) {
            let fireType = 5;
            const addRange = [[-(i + 1), 0], [0, -(i + 1)], [i + 1, 0], [0, i + 1]];
            if (i == bombUp)
                fireType = 1;
            bombSurround.forEach((e, j) => {
                if (bombSurround[j].length)
                    tileExplosion(e[0] + addRange[j][0], e[1] + addRange[j][1], j + fireType) ? null : bombSurround[j] = [];
            });
        }
        const flameEnd = allSprites.flames.length;
        clearFlames(flameStart, flameEnd);
    }
});
const tileExplosion = (x, y, i) => {
    if (gameBoard[y][x] !== 3 && x > 0 && y > 0 && x < modes[currMode].width && y < modes[currMode].height) {
        const dirs = ["middle", "left", "top", "right", "down", "midleft", "midtop", "midright", "middown"];
        if (gameBoard[y][x] == 4) {
            help.id(`brick${y},${x}`).style.display = 'none';
            allSprites.desBrick.push(new Anim(img, data.brick_des, `d_brick`, [x, y], "right", true));
        }
        flameCount++;
        allSprites.flames.push(new Anim(img, data.explosion, `explosion${flameCount}`, [x, y], dirs[i], true));
        flamePoses.push([x, y]);
        if (allSprites.player.pos[0] == x && allSprites.player.pos[1] == y)
            killPlayer();
        allSprites.baloons.forEach((e) => e.pos[0] == x && e.pos[1] == y ? killBaloon(e) : null);
        gameBoard[y][x] = 5;
    }
    return gameBoard[y][x] !== 3;
};
const clearFlames = (s, e) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((r) => setTimeout(r, 700));
    flamePoses.forEach((e) => {
        gameBoard[e[1]][e[0]] = 2;
        flameCount--;
    });
    flamePoses = [];
    allSprites.flames.toSpliced(0, e - s).forEach((f) => f.vanish());
    allSprites.flames.splice(0, e - s);
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
    help.query('#killcount').innerHTML = `${modes[currMode].opp - baloonCount}/${modes[currMode].opp}`;
    score += currKills * 50;
    help.id("score").innerHTML = score.toString();
    if (baloonCount == 0)
        endGame();
    switch (currKills) {
        case 1:
            break;
        case 2:
            comment("dk");
            break;
        case 3:
            comment("tk");
            break;
        case 4:
            comment("qk");
            break;
        default:
            comment("ik");
    }
});
const comment = (what) => {
    switch (what) {
        case "tk":
            hideCom("dk");
            break;
        case "qk":
            hideCom("tk");
            break;
        case "ik":
            hideCom("qk");
            break;
        default:
            break;
    }
    help.id(what).classList.remove("off");
    help.id(what).style.top = "37vh";
    help.id(what).style.left = "50%";
    setTimeout(() => hideCom(what), 2000);
};
const hideCom = (w) => {
    help.id(w).classList.add("off");
    help.id(w).style.top = "0";
};
const endGame = () => {
    help.id("end-screen").style.top = "50%";
    clearInterval(timeCounter);
    if (!isDead) {
        playerLeave();
        help.query("#img").src = "img/bombergif.gif";
        help.id("end-screen").style.border = "3px solid aqua";
        help.id("result").innerHTML = "congrats";
    }
    else {
        help.query("#img").src = "img/baloongif.gif";
        help.id("end-screen").style.border = "3px solid red";
        help.id("result").innerHTML = "get good";
    }
    help.id("time2").innerHTML = `${time.toString()}s`;
    help.id("score2").innerHTML = score.toString();
};
const playerLeave = () => {
    clearInterval(moveInterval);
    allSprites.player.currDir = "happyassguy";
    allSprites.player.actFrame = 0;
    allSprites.player.moving = true;
    body.appendChild(help.newTile("door", "sprite door", elements.doorUrl, allSprites.player.pos[0], allSprites.player.pos[1], dsplySize));
};
const mobileControls = () => {
    if (!mobileOn) {
        help.id("mobile-controls").style.display = "flex";
        help.id("w").addEventListener("touchstart", () => mobileKeyDown(87));
        help.id("w").addEventListener("touchend", () => mobileKeyUp(87));
        help.id("a").addEventListener("touchstart", () => mobileKeyDown(65));
        help.id("a").addEventListener("touchend", () => mobileKeyUp(65));
        help.id("s").addEventListener("touchstart", () => mobileKeyDown(83));
        help.id("s").addEventListener("touchend", () => mobileKeyUp(83));
        help.id("d").addEventListener("touchstart", () => mobileKeyDown(68));
        help.id("d").addEventListener("touchend", () => mobileKeyUp(68));
        help.id("z").addEventListener("touchstart", bombBind);
    }
    else
        help.id("mobile-controls").style.display = "none";
    mobileOn = !mobileOn;
};
const mobileKeyDown = (k) => {
    controller.includes(k) ? null : controller.push(k);
    currKey = k;
    movePlayer = true;
};
const mobileKeyUp = (k) => {
    controller.splice(controller.indexOf(k), 1);
    if (controller.length == 0)
        movePlayer = false;
    allSprites.player.moving = false;
};
