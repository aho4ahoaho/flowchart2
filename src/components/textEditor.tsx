import { CodeManager } from "./codeManager";
import style from "./textEditor.module.scss";
import React from "react";

type Props = {
    className?: string;
    value?: string;
    setValue?: (value: string) => void;
};

const indent = "    "; // 4 spaces

const keyboardHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
        e.preventDefault();
        const textArea = e.currentTarget;
        const startPos = textArea.selectionStart;
        const endPos = textArea.selectionEnd;
        const context = textArea.value;

        //Shift+TabとTabの処理を分ける
        if (e.shiftKey) {
            //選択がない場合
            if (startPos === endPos) {
                const after_context = context.substring(startPos);
                const before_context = context.substring(0, startPos);
                const before_lines = before_context.split("\n");
                const before_line = before_lines.pop() ?? "";
                if (before_line.substring(0, 4) === indent) {
                    const new_before_context =
                        before_lines.join("\n") +
                        "\n" +
                        before_line.substring(4);
                    textArea.value = new_before_context + after_context;
                    textArea.setSelectionRange(startPos - 4, startPos - 4);
                    return;
                }
            } else {
                //範囲選択の場合
                const before_context = context.substring(0, startPos - 1);
                const after_context = context.substring(endPos);
                let target_context = context.substring(startPos - 1, endPos);
                const lines = target_context.split("\n" + indent);
                target_context = (() => {
                    const ctx = lines.join("\n");
                    if (ctx.substring(0, 4) === indent) {
                        return ctx.substring(4);
                    }
                    return ctx;
                })();

                textArea.value =
                    before_context + target_context + after_context;
                textArea.setSelectionRange(
                    startPos,
                    startPos + target_context.length - 1,
                );
            }
        } else {
            //選択がない場合
            if (startPos === endPos) {
                const newContext = `${context.substring(
                    0,
                    startPos,
                )}    ${context.substring(startPos)}`;
                textArea.value = newContext;
                textArea.setSelectionRange(startPos + 4, startPos + 4);
                return;
            } else {
                //範囲選択の場合
                const before_context = context.substring(0, startPos - 1);
                const after_context = context.substring(endPos);
                let target_context = context.substring(startPos - 1, endPos);
                const lines = target_context.split("\n");
                target_context = `${lines.join("\n    ")}`;
                textArea.value =
                    before_context + target_context + after_context;
                textArea.setSelectionRange(
                    startPos,
                    startPos + target_context.length - 1,
                );
            }
        }
    }
};

export const TextEditor = ({ className, value, setValue }: Props) => {
    const [textBoxHeight, setTextBoxHeight] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const dummyRef = React.useRef<HTMLParagraphElement>(null);

    React.useEffect(() => {
        if (!dummyRef.current) return;
        setTextBoxHeight(dummyRef.current.clientHeight);
    }, [value, dummyRef]);

    React.useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = `calc(${textBoxHeight}px + 0.25rem)`;
    }, [textBoxHeight, textareaRef]);

    return (
        <div className={className}>
            <p ref={dummyRef} className={style.dummy}>
                {`${value} `}
            </p>
            <div className={style.editorContainer}>
                <textarea
                    className={style.editor}
                    value={value}
                    onChange={(e) => {
                        setValue?.(e.target.value);
                    }}
                    ref={textareaRef}
                    onKeyDown={(e) => {
                        keyboardHandler(e);
                        setValue?.(e.currentTarget.value);
                    }}
                />
            </div>
            <CodeManager value={value} setValue={setValue} />
        </div>
    );
};
