import { Button } from "./button";
import style from "./settings.module.scss";
import { ChartGeneratorOption, ChartStyle } from "@/logic/chartGenerator";
import { supportSystemChecker } from "@/logic/systemChecker";
import React from "react";
import Select from "react-select";

const FontFamilyList = [
    "arial",
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "math",
    "fangsong",
];

const WindowsFontFamilyList = [
    "MS UI Gothic",
    "MS PGothic",
    "MS PMincho",
    "MS Gothic",
    "MS Mincho",
    "Meiryo",
    "Meiryo UI",
    "Yu Gothic",
    "Yu Gothic UI",
    "Yu Mincho",
    "Yu Mincho UI",
    "HG丸ｺﾞｼｯｸM-PRO",
    "HGｺﾞｼｯｸE",
    "HGｺﾞｼｯｸM",
    "UD デジタル 教科書体 N-B",
    "UD デジタル 教科書体 N-R",
    "UD デジタル 教科書体 NK-B",
    "UD デジタル 教科書体 NK-R",
    "UD デジタル 教科書体 NP-B",
    "UD デジタル 教科書体 NP-R",
    "BIZ UDPゴシック",
    "BIZ UDP明朝 Medium",
    "BIZ UDゴシック",
    "BIZ UD明朝 Medium",
];

type Props = {
    className?: string;
    onClickDownload?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    setChartStyle?: React.Dispatch<React.SetStateAction<ChartStyle>>;
    setChartGenOption?: React.Dispatch<
        React.SetStateAction<ChartGeneratorOption>
    >;
};

const PullDownList = <T,>(props: {
    className?: string;
    values: T[];
    onChange: (value: T) => void;
}) => {
    return (
        <select
            className={props.className}
            onChange={(e) => props.onChange(e.target.value as unknown as T)}
        >
            {props.values.map((v, i) => (
                <option key={i} value={v as string} defaultChecked={i === 0}>
                    {v as string}
                </option>
            ))}
        </select>
    );
};

type selectOption = {
    value: string;
    label: string;
};

export const SettingsPanel = (props: Props) => {
    const { className, onClickDownload, setChartStyle, setChartGenOption } =
        props;

    const [fontOption, setFontOption] = React.useState<selectOption[]>([
        { value: FontFamilyList[0], label: FontFamilyList[0] },
    ]);

    const setStyle = (
        style: Partial<ChartStyle> | { font: Partial<ChartStyle["font"]> },
    ) => {
        if (!setChartStyle) return;
        setChartStyle((prev) => {
            return {
                ...prev,
                ...style,
                font: {
                    ...prev.font,
                    ...style.font,
                },
            };
        });
    };

    const setOption = (
        option:
            | Partial<ChartGeneratorOption>
            | { offset: Partial<ChartGeneratorOption["offset"]> },
    ) => {
        if (!setChartGenOption) return;
        setChartGenOption((prev) => {
            return {
                ...prev,
                ...option,
                offset: {
                    ...prev.offset,
                    ...option.offset,
                },
            };
        });
    };

    React.useEffect(() => {
        const os = supportSystemChecker();
        let font = FontFamilyList;
        if (os === "windows") {
            font = [...font, ...WindowsFontFamilyList.sort()];
        }
        setFontOption(
            font.map((v) => {
                return {
                    value: v,
                    label: v,
                };
            }),
        );
    }, []);

    return (
        <div className={`${style.settings ?? ""} ${className ?? ""}`}>
            <div className={style.container}>
                <div className={style.column}>
                    <p className={style.label}>サイズ設定</p>
                    <p>Width</p>
                    <input
                        type="number"
                        defaultValue={200}
                        step={20}
                        onChange={(e) => {
                            setOption({ width: Number(e.target.value) });
                        }}
                    />
                    <p>Height</p>
                    <input
                        type="number"
                        defaultValue={100}
                        step={10}
                        onChange={(e) => {
                            setOption({ height: Number(e.target.value) });
                        }}
                    />
                    <p>Margin</p>
                    <input
                        type="number"
                        defaultValue={50}
                        step={2}
                        onChange={(e) => {
                            setOption({ margin: Number(e.target.value) });
                        }}
                    />
                </div>
                <div className={style.column}>
                    <p className={style.label}>フォント設定</p>
                    <p>Family</p>
                    <Select
                        className={style.select}
                        defaultValue={fontOption[0]}
                        options={fontOption}
                        onChange={(value) => {
                            if (!value) return;
                            setStyle({ font: { family: value.value } });
                        }}
                    />
                    <input type="text" />
                    <p>Size</p>
                    <input
                        type="number"
                        defaultValue={20}
                        step={2}
                        onChange={(e) => {
                            setStyle({
                                font: { size: Number(e.target.value) },
                            });
                        }}
                    />
                    <p>Weight</p>
                    <PullDownList
                        className={style.select}
                        values={["normal", "bold"]}
                        onChange={(value) => {
                            if (!value) return;
                            setStyle({ font: { weight: value } });
                        }}
                    />
                </div>
                <div className={style.column} />
            </div>
            <div className={style.func_button}>
                <span />
                <Button onClick={onClickDownload}>ダウンロード</Button>
                <span />
            </div>
        </div>
    );
};
