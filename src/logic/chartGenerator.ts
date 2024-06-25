import { FunctionItem, Item } from "./scope";

export const chartGeneratorTest = (func: FunctionItem) => {
    let step = 1;
    let nest = 0;
    let max_nest = 0;
    const nodeProcesser = (nodes: Item[]) => {
        nodes.forEach((node, index) => {
            if (typeof node === "string") {
                step++;
            } else if (node.type === "if") {
                const s = ++step;
                const elseNest = node.elseNode
                    ? nestCount(node.elseNode) + 1
                    : 1;
                nest += elseNest;
                nodeProcesser(node.node);
                max_nest = Math.max(max_nest, nest);
                nest -= elseNest;

                if (node.elseNode) {
                    const s1 = step;
                    step = s;
                    nodeProcesser(node.elseNode);
                    step = Math.max(s1, step);
                }
            } else if (node.type === "loop") {
                nodeProcesser(node.node);
                const blockNest = nestCount(node.node);
                max_nest = Math.max(max_nest, nest + 1 + blockNest);
                step++;
            }
        });
    };
    nodeProcesser(func.node);
    step++;
    return [step, max_nest];
};

export type ChartGeneratorOption = {
    width: number;
    height: number;
    margin: number;
    offset: {
        x: number;
        y: number;
    };
};

// チャートを描画する
export const chartGenerator = (
    ctx: CanvasRenderingContext2D,
    func: FunctionItem,
    Option?: Partial<ChartGeneratorOption>,
    style?: Partial<ChartStyle>,
) => {
    //関数名がmainの場合は開始記号をSTARTに、終了記号をENDにする
    const name = func.name === "main" ? "START" : func.name;
    const rname = func.name === "main" ? "END" : "RTS";
    // サイズを定義する
    const size = {
        width: Option?.width ?? 200,
        height: Option?.height ?? 100,
        margin: Option?.margin ?? 50,
        offset: {
            x: Option?.offset?.x ?? 25,
            y: Option?.offset?.y ?? 25,
        },
    };

    // 描画するクラスをインスタンス化する
    const chart = new ChartShape(ctx, style ?? {});

    // 開始記号を描画する
    const funcName = func.args.length ? `${name}(${func.args})` : name;
    chart.terminator(
        size.offset.x,
        size.offset.y,
        size.width,
        size.height,
        funcName,
    );
    chart.arrow(
        size.offset.x + size.width / 2,
        size.offset.y + size.height,
        size.offset.x + size.width / 2,
        size.offset.y + size.height + size.margin,
    );

    let step = 1;
    let nest = 0;
    const nodeProcesser = (nodes: Item[]) => {
        nodes.forEach((node, index) => {
            //通常の文字列の場合
            if (typeof node === "string") {
                const x = nest * (size.width + size.margin) + size.offset.x;
                const y = step * (size.height + size.margin) + size.offset.y;

                // 関数呼び出しの形を描画する
                if (node.substring(node.length - 2) === "()") {
                    chart.predefinedProcess(
                        x,
                        y,
                        size.width,
                        size.height,
                        node.substring(0, node.length - 2),
                    );
                } else {
                    // 通常の処理の形を描画する
                    chart.process(x, y, size.width, size.height, node);
                }

                // 自分が最後でなければ矢印を描画する
                if (index !== nodes.length - 1) {
                    chart.arrow(
                        x + size.width / 2,
                        y + size.height,
                        x + size.width / 2,
                        y + size.height + size.margin,
                    );
                }
                step++;
            } else if (node.type === "if") {
                // 条件の形を描画する
                const x = nest * (size.width + size.margin) + size.offset.x;
                const y = step * (size.height + size.margin) + size.offset.y;
                chart.desicion(x, y, size.width, size.height, node.condition);

                // 矢印を描画する
                if (node.elseNode) {
                    chart.arrow(
                        x + size.width / 2,
                        y + size.height,
                        x + size.width / 2,
                        y + size.height + size.margin,
                    );
                }

                //else側のネストの深さを調べる
                const elseNest = node.elseNode
                    ? nestCount(node.elseNode) + 1
                    : 1; //ネストは0から始まるので+1する

                //Trueへの分岐線の描画
                (() => {
                    const x0 = x + size.width;
                    const y0 = y + size.height / 2;
                    const x1 =
                        x0 +
                        size.width / 2 +
                        size.margin +
                        (size.width + size.margin) * (elseNest - 1);
                    const y1 = y0;
                    const x2 = x1;
                    const y2 = y1 + size.height / 2 + size.margin;

                    chart.preProcess();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    chart.postProcess();

                    chart.arrow(x1, y1, x2, y2);
                })();

                //現状を保存する
                const s0 = ++step;
                nest += elseNest;
                // 再帰的に描画する
                nodeProcesser(node.node);
                nest -= elseNest;

                //true側のStep
                const s1 = step;
                let s2 = s0;
                // False側の描画
                if (node.elseNode) {
                    //if直後へ戻る
                    step = s0;
                    nodeProcesser(node.elseNode);
                    s2 = step;
                    //True側のStepとFalse側のStepの大きい方を採用する
                    step = Math.max(s1, step);
                }

                // True側からの戻りの矢印を描画する
                (() => {
                    const x =
                        (nest + 1) * (size.width + size.margin) + size.offset.x;
                    const y =
                        (s1 - 1) * (size.height + size.margin) + size.offset.y;
                    const x0 =
                        x +
                        size.width / 2 +
                        (size.width + size.margin) * (elseNest - 1);
                    const y0 = y + size.height;
                    const x1 = x0;
                    const y1 =
                        step * (size.height + size.margin) +
                        size.offset.y -
                        (size.margin / 3) * 2;
                    const x2 =
                        nest * (size.width + size.margin) +
                        size.offset.x +
                        size.width / 2;
                    const y2 = y1;
                    chart.preProcess();
                    //下向きの線
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    chart.postProcess();
                    //左向きの矢印
                    chart.arrow(x1, y1, x2, y2, "left");
                })();

                //False側からの戻りの矢印を描画する
                (() => {
                    const x = nest * (size.width + size.margin) + size.offset.x;
                    const y =
                        (s2 - 1) * (size.height + size.margin) + size.offset.y;
                    const x0 = x + size.width / 2;
                    const y0 = y + size.height;
                    const x1 = x0;
                    const y1 =
                        step * (size.height + size.margin) + size.offset.y;
                    if (index !== nodes.length - 1) {
                        chart.arrow(x0, y0, x1, y1);
                    } else {
                        //最後のノードの場合は線を最後まで引かない
                        chart.preProcess();
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x1, y1 - size.margin);
                        chart.postProcess();
                    }
                })();
            } else if (node.type === "loop") {
                const s0 = step;
                nodeProcesser(node.node);
                const x = nest * (size.width + size.margin) + size.offset.x;
                const y = step * (size.height + size.margin) + size.offset.y;
                chart.arrow(
                    x + size.width / 2,
                    y - size.margin,
                    x + size.width / 2,
                    y,
                    "down",
                );
                chart.desicion(x, y, size.width, size.height, node.condition);
                (() => {
                    const blockNest = nestCount(node.node);
                    const x0 = x + size.width;
                    const y0 = y + size.height / 2;
                    const x1 =
                        x0 +
                        size.width / 2 +
                        size.margin +
                        (size.width + size.margin) * blockNest;
                    const y1 = y0;
                    const x2 = x1;
                    const y2 =
                        s0 * (size.height + size.margin) +
                        size.offset.y -
                        size.margin / 3;
                    const x3 = x + size.width / 2;
                    const y3 = y2;
                    chart.preProcess();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    chart.postProcess();
                    chart.arrow(x2, y2, x3, y3, "left");
                })();
                step++;
                if (index !== nodes.length - 1) {
                    chart.arrow(
                        x + size.width / 2,
                        y + size.height,
                        x + size.width / 2,
                        y + size.height + size.margin,
                    );
                }
            }
        });
    };
    nodeProcesser(func.node);
    // 終了記号を描画する
    const x = nest * (size.width + size.margin) + size.offset.x;
    const y = (step - 1) * (size.height + size.margin) + size.offset.y;
    chart.arrow(
        x + size.width / 2,
        y + size.height,
        x + size.width / 2,
        y + size.height + size.margin,
    );
    chart.terminator(
        size.offset.x,
        step * (size.height + size.margin) + size.offset.y,
        size.width,
        size.height,
        rname,
    );
};

const nestCount = (nodes: Item[]) => {
    let nest = 0;
    let max_nest = 0;
    const nodeProcesser = (nodes: Item[]) => {
        nodes.forEach((node, index) => {
            if (typeof node === "string") {
                //何もしない
            } else if (node.type === "if") {
                nest++;
                nodeProcesser(node.node);
                max_nest = Math.max(max_nest, nest);
                nest--;
                if (node.elseNode) {
                    nodeProcesser(node.elseNode);
                }
            } else if (node.type === "loop") {
                nodeProcesser(node.node);
            }
        });
    };
    nodeProcesser(nodes);
    return max_nest;
};

export type ChartStyle = {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: {
        family: string;
        size: number;
        weight: string;
    };
};

class ChartShape {
    private ctx: CanvasRenderingContext2D;
    private style: ChartStyle;
    constructor(
        ctx: CanvasRenderingContext2D,
        style: Partial<ChartStyle> = {},
    ) {
        this.ctx = ctx;
        this.style = {
            fillStyle: style.fillStyle ?? "black",
            strokeStyle: style.strokeStyle ?? "black",
            lineWidth: 2,
            font: {
                family: style.font?.family ?? "serif",
                size: style.font?.size ?? 20,
                weight: style.font?.weight ?? "normal",
            },
        };
    }

    private saveCtx() {
        this.ctx.save();
    }
    private restoreCtx() {
        this.ctx.restore();
    }
    private setCtxStyle(style?: Partial<ChartStyle>) {
        if (style) {
            this.style = {
                ...this.style,
                ...style,
            };
        }
        const ctx = this.ctx;
        ctx.fillStyle = this.style.fillStyle;
        ctx.strokeStyle = this.style.strokeStyle;
        ctx.lineWidth = 2;
        ctx.font = `${this.style.font.weight} ${this.style.font.size}px ${this.style.font.family}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }
    preProcess() {
        this.saveCtx();
        this.setCtxStyle();
        this.ctx.beginPath();
    }
    postProcess() {
        this.ctx.stroke();
        this.ctx.closePath();
        this.restoreCtx();
    }
    private intermidiaryProcess() {
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();
    }

    // 処理の形を描画する
    process(
        x: number,
        y: number,
        width: number,
        height: number,
        text?: string,
    ) {
        this.preProcess();
        this.ctx.rect(x, y, width, height);
        text ? this.ctx.fillText(text, x + width / 2, y + height / 2) : "";
        this.postProcess();
    }
    // 準備の形を描画する
    initialization(
        x: number,
        y: number,
        width: number,
        height: number,
        text?: string,
    ) {
        console.log("Coming soon...");
        console.log("initialization", x, y, width, height, text);
    }
    // サブルーチンの形を描画する
    predefinedProcess(
        x: number,
        y: number,
        width: number,
        height: number,
        text?: string,
        frameWidth = 7,
    ) {
        this.preProcess();
        const fW = width / frameWidth;
        this.ctx.rect(x, y, width, height);
        this.ctx.moveTo(x + fW, y);
        this.ctx.lineTo(x + fW, y + height);
        this.ctx.moveTo(x + fW * (frameWidth - 1), y);
        this.ctx.lineTo(x + fW * (frameWidth - 1), y + height);
        text ? this.ctx.fillText(text, x + width / 2, y + height / 2) : "";
        this.postProcess();
    }
    // 条件の形を描画する
    desicion(
        x: number,
        y: number,
        width: number,
        height: number,
        text?: string,
    ) {
        const point = [
            { x: x + width / 2, y: y },
            { x: x + width, y: y + height / 2 },
            { x: x + width / 2, y: y + height },
            { x: x, y: y + height / 2 },
        ];
        this.preProcess();
        this.ctx.moveTo(point[0].x, point[0].y);
        this.ctx.lineTo(point[1].x, point[1].y);
        this.ctx.lineTo(point[2].x, point[2].y);
        this.ctx.lineTo(point[3].x, point[3].y);
        this.ctx.lineTo(point[0].x, point[0].y);
        text ? this.ctx.fillText(text, x + width / 2, y + height / 2) : "";
        this.postProcess();
    }
    // 矢印を描画する
    arrow(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        direction: "left" | "right" | "up" | "down" = "down",
        arrowSize = 5,
    ) {
        this.preProcess();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        switch (direction) {
            case "down":
                this.ctx.lineTo(x2 + arrowSize, y2 - arrowSize);
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - arrowSize, y2 - arrowSize);
                break;
            case "left":
                this.ctx.lineTo(x2 + arrowSize, y2 - arrowSize);
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 + arrowSize, y2 + arrowSize);
                break;
            case "right":
                this.ctx.lineTo(x2 - arrowSize, y2 - arrowSize);
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - arrowSize, y2 + arrowSize);
                break;
            case "up":
                this.ctx.lineTo(x2 + arrowSize, y2 + arrowSize);
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - arrowSize, y2 + arrowSize);
                break;
        }

        this.postProcess();
    }
    // 開始/終了の形を描画する:楕円
    terminator(
        x: number,
        y: number,
        width: number,
        height: number,
        text?: string,
    ) {
        const horizontalCenter = x + width / 2;
        const verticalCenter = y + height / 2;
        this.preProcess();
        this.ctx.ellipse(
            horizontalCenter,
            verticalCenter,
            width / 2,
            height / 2,
            0,
            0,
            2 * Math.PI,
        );
        text ? this.ctx.fillText(text, x + width / 2, y + height / 2) : "";
        this.postProcess();
    }
}
