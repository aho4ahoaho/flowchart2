import styled from "@emotion/styled";
import React from "react";
import { example_code } from "../logic/exampleCode";
import { FunctionItem } from "../logic/scope";
import { codeParser } from "../logic/parser";
import style from "./main.css"
import { TextEditor } from "../components/textEditor";
import { ChartContainer } from "../components/chart";

export function Main() {
  const [text, setText] = React.useState("");
  const [functions, setFunctions] = React.useState<FunctionItem[]>([]);

  React.useEffect(() => {
    setText(example_code);
  }, []);

  React.useEffect(() => {
    const f = codeParser(text);
    setFunctions(f);
  }, [text]);
  return (
    <div id="main" className={style.main}>
      <TextEditor
        className={style.leftPanel}
        value={text}
        setValue={setText}
      />
      <ChartContainer
        className={style.rightPanel}
        functions={functions}
      />
    </div>
  );
}