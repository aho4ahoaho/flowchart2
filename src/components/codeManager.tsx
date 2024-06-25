import { Button } from "./button";
import style from "./codeManager.module.scss";
import { japaneseDateFormat } from "@/logic/dateFormat";
import { importLocalFile } from "@/logic/fileHandler";
import React, { FormEvent } from "react";
import { codeFormatter } from "@/logic/formatter";
import { codeParser } from "@/logic/parser";

type Props = {
    className?: string;
    value?: string;
    setValue?: (value: string) => void;
};

type CodeData = {
    name: string;
    code: string;
    update_at: Date;
};
type CodeList = {
    [name: string]: CodeData;
};

export const CodeManager = (props: Props) => {
    const [saveName, setSaveName] = React.useState<string>("");
    const [loadName, setLoadName] = React.useState<string>("");
    const [codeList, setCodeList] = React.useState<CodeList>({});

    //コードのフォーマット
    const onFormatClick = () => {
        const { value, setValue } = props;
        if (!value || !setValue) return;
        const functions = codeParser(value);
        console.log(functions);
        const code = codeFormatter(functions);
        console.log(code);
        setValue(code);
    };

    //ローカルストレージからコードリストを取得
    const getCodeList = () => {
        const codeList = JSON.parse(
            localStorage.getItem("codeList") ?? "{}",
        ) as CodeList;
        for (const key in codeList) {
            codeList[key].update_at = new Date(codeList[key].update_at);
        }
        return codeList;
    };
    //コードデータをローカルストレージに保存
    const saveData = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!props.value) {
            alert("保存するコードがありません");
            return;
        } else if (saveName.trim() === "") {
            alert("名前を入力してください");
            return;
        }
        const name = saveName;
        const code = props.value;
        const update_at = new Date();
        const data: CodeData = {
            name,
            code,
            update_at,
        };
        const codeList: CodeList = JSON.parse(
            localStorage.getItem("codeList") ?? "{}",
        );
        codeList[name] = data;
        localStorage.setItem("codeList", JSON.stringify(codeList));
    };

    const loadData = () => {
        const codeList = getCodeList();
        const data = codeList[loadName] as CodeData | undefined;
        if (data && props.setValue) {
            props.setValue(data.code);
            setSaveName(loadName);
        }
    };

    const deleteData = () => {
        if (!confirm(`${loadName}を削除しますか？`)) {
            return;
        }
        const codeList = getCodeList();
        delete codeList[loadName];
        localStorage.setItem("codeList", JSON.stringify(codeList));
    };

    React.useEffect(() => {
        const codeList = getCodeList();
        setCodeList(codeList);
        const key = Object.keys(codeList)[0];
        if (key) {
            setLoadName(key);
        }
    }, []);

    return (
        <div className={props.className}>
            <div className={style.section}>
                <p className={style.label}>Code Manager</p>
                <Button onClick={onFormatClick}>Format</Button>
            </div>
            <div className={style.section}>
                <p className={style.label}>Save</p>
                <form onSubmit={saveData}>
                    <input
                        type="text"
                        placeholder="save name"
                        onChange={(e) => {
                            setSaveName(e.target.value);
                        }}
                        value={saveName}
                    />
                    <Button type="submit">QuickSave</Button>
                </form>
            </div>
            {Object.keys(codeList).length !== 0 && (
                <div className={style.section}>
                    <p className={style.label}>Load</p>
                    <select
                        onClick={() => {
                            setCodeList(getCodeList());
                        }}
                        onChange={(e) => setLoadName(e.target.value)}
                    >
                        {Object.entries<CodeData>({ ...codeList }).map(
                            ([name, data], index) => {
                                return (
                                    <option key={index} value={name}>
                                        {name} (
                                        {japaneseDateFormat(data.update_at)})
                                    </option>
                                );
                            },
                        )}
                    </select>
                    <div className={style.row}>
                        <Button onClick={loadData}>Load</Button>
                        <Button onClick={deleteData}>Delete</Button>
                    </div>
                </div>
            )}
            <div className={style.section}>
                <p className={style.label}>File</p>
                <div className={style.row}>
                    <Button
                        onClick={() => {
                            importLocalFile().then((data) => {
                                if (props.setValue) {
                                    props.setValue(data);
                                }
                            });
                        }}
                    >
                        Import
                    </Button>
                    <Button
                        onClick={() => {
                            if (!props.value || props.value === "") {
                                alert("コードがありません");
                                return;
                            }
                            const blob = new Blob([props.value], {
                                type: "text/plain",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "code.txt";
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Export
                    </Button>
                </div>
            </div>
        </div>
    );
};
