import React from "react";
import { example_code } from "../logic/exampleCode";
import { FunctionItem } from "../logic/scope";
import { codeParser } from "../logic/parser";
import style from "./main.module.css";
import { TextEditor } from "../components/textEditor";
import { ChartContainer } from "../components/chart";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

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
    <>
      <Header />
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
      <Footer />
    </>
  );
}