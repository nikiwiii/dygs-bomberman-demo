export class Helper {
    constructor() {
        this.query = document.querySelector.bind(document);
        this.id = document.getElementById.bind(document);
        this.size = 40;
        this.busy = '';
    }
    newTile(id, clname, bkgrd, x, y, size) {
        const el = document.createElement('div');
        el.id = id;
        el.className = clname;
        el.style.backgroundImage = "url('" + bkgrd + "')";
        el.style.top = `${y * size}px`;
        el.style.left = `${x * size}px`;
        return el;
    }
    checkMoveAvail(hbx1, hby1, hbx2, hby2, velo, gameBoard, size) {
        if (![2, 5, 6].includes(gameBoard[Math.round(hbx1 / size)][Math.round(hby1 / size)]) ||
            ![2, 5, 6].includes(gameBoard[Math.round(hbx2 / size)][Math.round(hby2 / size)])) {
            return 'stay';
        }
        else {
            return velo;
        }
    }
    getNRandomFreePositions(amount, width, height) {
        let count = amount;
        let pos = [];
        while (count >= 0) {
            const x = Math.floor(Math.random() * (width - 1));
            const y = Math.floor(Math.random() * (height - 1));
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
