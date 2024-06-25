import style from "./chart.module.scss";
import { SettingsPanel } from "./settings";
import {
    ChartGeneratorOption,
    ChartStyle,
    chartGenerator,
    chartGeneratorTest,
} from "@/logic/chartGenerator";
import { FunctionItem } from "@/logic/scope";
import React from "react";

type Props = {
    className?: string;
    functions: FunctionItem[];
};

const defaultChartGenOption: ChartGeneratorOption = {
    width: 200,
    height: 100,
    margin: 50,
    offset: {
        x: 25,
        y: 25,
    },
};

const defaultStyle: ChartStyle = {
    fillStyle: "black",
    strokeStyle: "black",
    lineWidth: 1,
    font: {
        family: "sans-serif",
        size: 20,
        weight: "normal",
    },
};

export const ChartContainer = (props: Props) => {
    const { className, functions } = props;
    const [chartGenOption, setChartGenOption] =
        React.useState<ChartGeneratorOption>(defaultChartGenOption);
    const [chartstyle, setChartStyle] = React.useState(defaultStyle);

    const chartDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        document
            .querySelectorAll<HTMLCanvasElement>("canvas")
            .forEach((canvas, i) => {
                const a = document.createElement("a");
                a.href = canvas.toDataURL();
                a.download = `${canvas.getAttribute("func_name") ?? i}.png`;
                a.click();
            });
    };

    return (
        <div className={`${className}`}>
            <SettingsPanel
                className={style.settings}
                onClickDownload={chartDownload}
                setChartStyle={setChartStyle}
                setChartGenOption={setChartGenOption}
            />
            <div className={style.ChartContainer}>
                {functions.map((f, i) => {
                    return (
                        <Chart
                            key={i}
                            className={style.chart}
                            function={f}
                            option={chartGenOption}
                            chartStyle={chartstyle}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const Chart = (props: {
    className?: string;
    function: FunctionItem;
    option: ChartGeneratorOption;
    chartStyle?: ChartStyle;
}) => {
    const { className, function: func } = props;

    const ref = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        //キャンバスのサイズを計算
        const [step, nest] = chartGeneratorTest(func);
        const { width, height, margin, offset } = props.option;
        ref.current?.setAttribute(
            "width",
            `${(nest + 1) * width + nest * margin + 2 * offset.x}px`,
        );
        ref.current?.setAttribute(
            "height",
            `${step * height + (step - 1) * margin + 2 * offset.y}px`,
        );

        //背景を塗る
        const ctx = ref.current?.getContext("2d");
        if (!ctx || !func) return;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ref.current?.width ?? 0, ref.current?.height ?? 0);

        ref.current?.setAttribute("func_name", func.name);

        //グラフを描画
        chartGenerator(ctx, func, props.option, props.chartStyle);
    }, [func, ref, props.option, props.chartStyle]);
    return (
        <div className={className}>
            <canvas ref={ref} />
        </div>
    );
};
