import style from "./header.module.scss";

export const Header = () => {
    return (
        <header className={style.header}>
            <a href="/">
                <p>FlowChart</p>
                <p>Generator</p>
            </a>
            <div className={style.menu}></div>
        </header>
    );
};
