import { FunctionItem, Item } from "./scope";

export const codeFormatter = (functions: FunctionItem[]) => {
    return functions.map(functionToText).join("\n\n");
};

const functionToText = (func: FunctionItem) => {
    return `fn ${func.name}(${func.args}){\n${func.node
        .map((node) => nodeToText(node, 1))
        .join("\n")}}`;
};

const INDENT = "    ";
const nodeToText = (node: Item, nest = 0): string => {
    let context = INDENT.repeat(nest);
    if (typeof node === "string") {
        context += `${node};\n`;
    } else {
        //ブロックを開く
        context += `${node.type}(${node.condition}){\n`;

        //ノードを追加
        context += node.node
            .map((node) => nodeToText(node, nest + 1))
            .join("\n");

        //ブロックを閉じる
        context += `${INDENT.repeat(nest)}}`;

        if (node.elseNode) {
            context += `else{\n`;
            context += node.elseNode
                .map((node) => nodeToText(node, nest + 1))
                .join("\n");
            context += `${INDENT.repeat(nest)}}`;
        }

        context += `\n`;
    }
    return context;
};
