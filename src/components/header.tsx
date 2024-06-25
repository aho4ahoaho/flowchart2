import style from "./header.module.scss";
import Link from "next/link";

export const Header = () => {
    return (
        <header className={style.header}>
            <Link href="/">
                <p>FlowChart</p>
                <p>Generator</p>
            </Link>
            <div className={style.menu}></div>
        </header>
    );
};
