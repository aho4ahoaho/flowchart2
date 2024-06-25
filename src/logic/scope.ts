export type FunctionItem = {
    name: string;
    args: string;
    index: number;
    end: number;
    node: Item[];
    raw: {
        start: number;
        context: string;
    };
};

export type Item = string | Scope;

export type Scope = {
    type: "if" | "loop";
    condition: string;
    node: Item[];
    elseNode?: Item[];
};

//スコープの終わりを探す
export const searchScopeEnd = (context: string, index: number): number => {
    let scope = 0;
    for (let i = index; i < context.length; i++) {
        if (context[i] === "{") scope++;
        if (context[i] === "}") scope--;
        if (scope === 0) return i;
    }
    return -1;
};

// 文またはスコープに分割する。
// 関数searchSentenceの定義。引数はコンテキストという文字列。
export const searchSentence = (context: string): Item[] => {
    // 出力用のItem配列を初期化する
    const nodes: Item[] = [];

    // contextの前後の空白を削除
    context = context.trim();

    // contextの最初の文字が"{"であれば、その文字を削除
    if (context[0] === "{") context = context.substring(1).trim();

    // contextの最後の文字が"}"であれば、その文字を削除
    if (context[context.length - 1] === "}")
        context = context.substring(0, context.length - 1).trim();

    // contextの文字列を一文字ずつチェックする
    let i = 0;
    while (i < context.length) {
        // "if"キーワードの検出
        if (context.substring(i, i + 2) === "if") {
            // if文の範囲を見つける
            const startIndex = context.indexOf("{", i + 2);
            const endIndex = searchScopeEnd(context, startIndex);
            if (startIndex !== -1 && endIndex !== -1) {
                // if文の情報をnodesに追加
                const node: Scope = {
                    type: "if",
                    condition: context.substring(
                        i + 3,
                        context.indexOf("{", i + 2) - 1,
                    ),
                    node: searchSentence(
                        context.substring(startIndex + 1, endIndex + 1),
                    ),
                };

                // 処理した範囲をcontextから削除し、インデックスをリセット
                i = 0;
                context = context.substring(endIndex + 1).trim();
                if (context.substring(0, 4) === "else") {
                    // else文の範囲を見つける
                    const startIndex = context.indexOf("{", 4);
                    const endIndex = searchScopeEnd(context, startIndex);

                    // else文の情報をnodesに追加
                    node.elseNode = searchSentence(
                        context.substring(startIndex + 1, endIndex + 1),
                    );

                    // 処理した範囲をcontextから削除
                    context = context.substring(endIndex + 1).trim();
                }
                nodes.push(node);
                continue;
            }
        }

        // "loop"キーワードの検出
        if (context.substring(i, i + 4) === "loop") {
            // loop文の範囲を見つける
            const startIndex = context.indexOf("{", i + 4);
            const endIndex = searchScopeEnd(context, startIndex);
            if (startIndex !== -1 && endIndex !== -1) {
                // loop文の情報をnodesに追加
                const node: Scope = {
                    type: "loop",
                    condition: context.substring(
                        i + 5,
                        context.indexOf("{", i + 4) - 1,
                    ),
                    node: searchSentence(
                        context.substring(startIndex + 1, endIndex + 1),
                    ),
                };
                nodes.push(node);

                // 処理した範囲をcontextから削除
                context = context.substring(endIndex + 1).trim();
                i = 0;
                continue;
            }
        }

        // 次の";"までを一つのノードとする
        const endIndex = context.indexOf(";", i);
        const node = context.substring(i, endIndex);
        nodes.push(node);

        // ";"が見つからなかったら、ループを抜ける
        if (endIndex === -1) break;

        // 処理した範囲をcontextから削除
        context = context.substring(endIndex + 1).trim();
    }
    // 処理結果のnodesを返す
    return nodes;
};
