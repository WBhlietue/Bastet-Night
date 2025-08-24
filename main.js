const ctx = Get("b").getContext("2d");
const bgCtx = Get("a").getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
var pause = true;
var tPause = false;
const w = 640;
const h = 360;
const objects = [];
const monsters = [];
let score = 0;
let canSelect = false;
let point = 0;
let panel = Get("p");
let upgrades = {
    speed: 0,
    atk: 0,
    hp: 0,
    hpReg: 0,
    range: 0,
};
const up = [0, 1, 2, 3, 4].flatMap((n) => new Array(10).fill(n));
const price = [1, 2, 3, 5, 8, 13, 21, 34, 55];
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

let chig = [0, 0];
Get("h").innerHTML =
    "High score: " +
    (localStorage.getItem("score", 0) == null
        ? 0
        : localStorage.getItem("score"));
function Get(id) {
    return document.getElementById(id);
}

function Dis(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function IsCol(a, b, c = 1) {
    return !(
        a.x + a.size * c < b.x ||
        a.x > b.x + b.size * c ||
        a.y + a.size * c < b.y ||
        a.y > b.y + b.size * c
    );
}

function RefreshUpgrade() {
    for (let i = 1; i < 4; i++) {
        const a = Get("y" + i);
        const b = Rand(up.length);
        a.value = b;
        switch (up[b]) {
            case 0:
                a.innerHTML =
                    "Speed++<br><br><br>Point:" + price[upgrades.speed] * 10;
                break;
            case 1:
                a.innerHTML =
                    "Atk++<br><br><br>Point:" + price[upgrades.atk] * 10;
                break;
            case 2:
                a.innerHTML =
                    "HP++<br><br><br>Point:" + price[upgrades.hp] * 10;
                break;
            case 3:
                a.innerHTML =
                    "HP Regen++<br><br><br>Point:" + price[upgrades.hpReg] * 10;
                break;
            case 4:
                a.innerHTML =
                    "Range++<br><br><br>Point:" + price[upgrades.range] * 10;
                break;
        }
    }
}
RefreshUpgrade();

class Obj {
    x = 0;
    y = 0;
    anim = 0;
    imgs = [];
    flip = false;
    a = 0;
    animTarget = 1;
    animInterval = 200;
    interval;
    size = 32;
    hp = 10;
    maxHp = 10;
    constructor(img) {
        img.map((i) => {
            const im = new Image();
            im.src = `./${i}.png`;
            this.imgs.push(im);
        });
    }
    Init() {
        this.interval = setInterval(() => {
            if (pause || tPause) {
                return;
            }
            this.a = (this.a + 1) % this.animTarget;
        }, this.animInterval);
        objects.push(this);
    }
    Render() {
        let a = this.size;
        let b = a / 2;
        ctx.save();
        if (this.flip) {
            ctx.translate(this.x + b, this.y + b);
            ctx.scale(-1, 1);
            ctx.drawImage(this.imgs[this.anim], -b, -b, a, a);
        } else {
            ctx.drawImage(this.imgs[this.anim], this.x, this.y, a, a);
        }

        ctx.restore();
    }
    Update() {}
    Remove() {
        objects.splice(objects.indexOf(this), 1);
        clearInterval(this.interval);
    }
    After() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 5, this.size, 3);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 5, this.size * (this.hp / this.maxHp), 3);
    }
}
class Player extends Obj {
    animTarget = 4;
    Update() {
        if (chig[0] == 0 && chig[1] == 0) {
            this.anim = 0;
        } else {
            let x = this.x,
                y = this.y;
            this.x = clamp(
                this.x + chig[0] * (2 + 0.2 * upgrades.speed),
                0,
                w - 32
            );
            this.y = clamp(
                this.y + chig[1] * (2 + 0.2 * upgrades.speed),
                0,
                h - 32
            );
            if (IsCol(this, house, 0.9)) {
                this.x = x;
                this.y = y;
            }
            if (chig[0] != 0) this.flip = chig[0] < 0;
            this.anim = this.a;
        }
    }
}

function Rand(n) {
    return Math.round(Math.random() * n);
}
function Clear() {
    ctx.clearRect(0, 0, w, h);
}
function SetHP() {
    let l = house.maxHp - house.hp;
    house.maxHp = 100 + upgrades.hp * 10;
    house.hp = house.maxHp - l;
}
function PlayerAtk() {
    const atk = new Obj(["atk1", "atk2", "atk3", "atk4", "atk5"]);
    atk.x =
        player.x +
        (player.flip ? -1 : 1) * (Rand(20) + 20 + upgrades.range * 2);
    atk.y = player.y - 2.5 * upgrades.range;
    atk.flip = player.flip;
    atk.animInterval = 50;
    atk.animTarget = 5;
    atk.size = 32 + upgrades.range * 6;
    zzfx(
        ...[, , 860, 0.03, 0.01, 0.31, 4, 1.7, , , , , , , , , , 0.77, , 0.02]
    );
    atk.Update = () => {
        atk.anim = atk.a;
        monsters.map((i) => {
            if (IsCol(atk, i)) {
                if (!i.iFrame) {
                    i.hp -= upgrades.atk + 1;
                    i.iFrame = true;
                    if (i.hp <= 0) {
                        point += i.num;
                        monsters.splice(monsters.indexOf(i), 1);
                        i.Remove();
                        zzfx(
                            ...[
                                1.8,
                                ,
                                425,
                                0.02,
                                0.01,
                                0.16,
                                3,
                                0.1,
                                ,
                                ,
                                ,
                                ,
                                ,
                                1.4,
                                ,
                                0.2,
                                0.1,
                                0.67,
                                0.01,
                                ,
                                381,
                            ]
                        );
                        score++;
                        if (score > localStorage.getItem("score")) {
                            localStorage.setItem("score", score);
                        }
                        if (score == 10) {
                            setInterval(() => {
                                if (pause || tPause) {
                                    return;
                                }
                                SpawnMonster(1, 3, "monster1", 1, 0.5);
                            }, 5000);
                        }
                        if (score == 20) {
                            setInterval(() => {
                                if (pause || tPause) {
                                    return;
                                }
                                SpawnMonster(1, 5, "monster2", 1, 1);
                            }, 5000);
                        }
                        if (score == 50) {
                            setInterval(() => {
                                if (pause || tPause) {
                                    return;
                                }
                                SpawnMonster(2, 7, "monster3", 2, 0.5);
                            }, 5000);
                        }
                        if (score == 75) {
                            setInterval(() => {
                                if (pause || tPause) {
                                    return;
                                }
                                SpawnMonster(2.5, 3, "monster4", 3, 0.5);
                            }, 5000);
                        }
                        if (score == 100) {
                            setInterval(() => {
                                if (pause || tPause) {
                                    return;
                                }
                                SpawnMonster(1.5, 20, "monster5", 5, 1);
                            }, 5000);
                        }
                    }
                    setTimeout(() => {
                        i.iFrame = false;
                    }, 300);
                }
            }
        });
    };
    atk.After = () => {};
    setTimeout(() => {
        atk.Remove();
    }, 250);
    atk.Init();
}
Get("l").addEventListener("click", () => {
    pause = false;
    Get("s").style.display = "none";
    Music();
    setInterval(Music, 0.17 * 32 * 1000);
});
function SpawnMonster(speed, hp, name, num, rate) {
    const monster = new Obj([name]);
    let a = Rand(2);
    if (Rand(2) == 1) {
        monster.x = Rand(w);
        monster.y = Rand(2) == 0 ? -32 : h + 32;
    } else {
        monster.x = Rand(2) == 0 ? -32 : w + 32;
        monster.y = Rand(h);
    }
    monster.num = num;
    monster.rate = rate;
    monster.hp = hp;
    monster.maxHp = hp;
    monster.iFrame = false;
    monster.counter = 0;
    monster.Update = () => {
        if (IsCol(monster, house)) {
            monster.counter += 1;
            if (monster.counter >= 60) {
                house.hp--;
                zzfx(
                    ...[
                        1.5,
                        ,
                        494,
                        ,
                        0.02,
                        0.08,
                        1,
                        3.8,
                        ,
                        -4,
                        ,
                        ,
                        ,
                        1.3,
                        ,
                        0.4,
                        ,
                        0.62,
                        0.05,
                        ,
                        1610,
                    ]
                );
                if (house.hp <= 0) {
                    GameOver();
                }
                monster.counter = 0;
            }
        } else {
            monster.counter = 0;
            let nX = (house.x - monster.x) / Dis(monster, house);
            let nY = (house.y - monster.y) / Dis(monster, house);
            monster.x += nX * speed;
            monster.y += nY * speed;
        }
    };
    monsters.push(monster);
    monster.Init();
}

function GameOver() {
    pause = true
    zzfx(
        ...[
            1.2,
            ,
            489,
            ,
            0.04,
            0.26,
            1,
            2.1,
            -4,
            ,
            278,
            0.09,
            0.07,
            ,
            ,
            0.1,
            ,
            0.66,
            0.01,
        ]
    );
    Get("o").style.display = "flex";
    Get("o1").innerHTML = "current score: " + score;
    Get("o2").innerHTML = "high score: " + localStorage.getItem("score");
}

function Resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let main = Get("c");
    let scale = 1;
    let testWidth;
    testWidth = (height / h) * w;
    if (testWidth < width) {
        scale = testWidth / w;
    } else {
        scale = width / w;
    }
    console.log(scale);
    main.style.transform = " scale(" + scale + ")  translateX(-50%)";
}

const player = new Player(["cat1", "cat2", "cat1", "cat3"]);
player.After = () => {};
player.Init();
player.x = 200;
player.y = 150;
const house = new Obj(["house"]);
house.size = 100;
house.maxHp = 100;
house.hp = 100;
house.x = 270;
house.y = 110;
house.Init();

const keys = {};

function Select(num) {
    if (!canSelect) {
        return;
    }
    let v = Get("y" + num).value;
    console.log(Object.keys(upgrades));
    const p = price[upgrades[Object.keys(upgrades)[up[v]]]] * 10;
    if (p > point) {
        return;
    }
    canSelect = false;
    point -= p;
    console.log(point);
    upgrades[Object.keys(upgrades)[up[v]]] += 1;
    up.splice(v, 1);
    panel.style.display = "none";
    pause = false;
    RefreshUpgrade();
    SetHP();
}
function Init() {
    RefreshUpgrade();
    Resize();
    setInterval(() => {
        if (pause || tPause) {
            return;
        }
        SpawnMonster(1, 3, "monster1", 1, 0.5);
    }, 5000);
    setInterval(() => {
        if (pause || tPause) {
            return;
        }
        house.hp += upgrades.hpReg;
        if (house.hp > house.maxHp) {
            house.hp = house.maxHp;
        }
    }, 10000);
    document.addEventListener("keydown", (e) => {
        if (!keys[e.key] && e.key == " ") {
            PlayerAtk();
        }
        if (!keys[e.key] && e.key == "f") {
            panel.style.display = "flex";
            pause = true;
            canSelect = true;
        }
        if (!keys[e.key] && e.key == "Escape") {
            panel.style.display = "none";
            pause = false;
            canSelect = false;
        }
        if (!keys[e.key] && e.key == "1") {
            Select(1);
        }
        if (!keys[e.key] && e.key == "2") {
            Select(2);
        }
        if (!keys[e.key] && e.key == "3") {
            Select(3);
        }
        keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });
    for (let i = 0; i < 160; i++) {
        for (let j = 0; j < 90; j++) {
            bgCtx.fillStyle = `hsl(115, 100%, ${Math.random() * 5 + 30}%)`;
            bgCtx.fillStyle = `hsl(51, 60%, ${Math.random() * 5 + 30}%)`;
            bgCtx.fillRect(i * 5, j * 5, 5, 5);
        }
    }
}

function Input() {
    chig = [0, 0];
    if (keys["w"]) chig[1] = -1;

    if (keys["a"]) chig[0] = -1;

    if (keys["s"]) chig[1] = 1;

    if (keys["d"]) chig[0] = 1;
}

function Render() {
    objects.map((i) => {
        i.Update();
        i.Render();
    });
    objects.map((i) => {
        i.After();
    });
}

function Update() {
    if (!pause && !tPause) {
        Clear();
        Input();
        Render();
        Get("d").innerHTML = "Score: " + score;
    }
    Get("e").innerHTML = "Point: " + point;
    requestAnimationFrame(Update);
}
Init();
Update();

function Music() {
    with (new AudioContext())
        with ((G = createGain()))
            for (i in (D = [
                12,
                15,
                15,
                13,
                9,
                11,
                11,
                ,
                7,
                11,
                11,
                9,
                4,
                7,
                7,
                ,
                4,
                7,
                7,
                ,
                9,
                11,
                11,
                ,
                5,
                8,
                10,
                15,
                13,
                10,
                13,
                ,
                13,
                10,
                13,
            ]))
                with (createOscillator())
                    if (D[i])
                        connect(G),
                            G.connect(destination),
                            start(i * 0.15),
                            frequency.setValueAtTime(
                                200 * 1.06 ** (13 - D[i]),
                                i * 0.15
                            ),
                            (type = "triangle"),
                            gain.setValueAtTime(0.5, i * 0.15),
                            gain.setTargetAtTime(
                                0.0001,
                                i * 0.15 + 0.13,
                                0.005
                            ),
                            stop(i * 0.15 + 0.14);
}
