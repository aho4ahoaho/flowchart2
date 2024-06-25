import style from "./button.module.scss";
import React, { ButtonHTMLAttributes } from "react";

export const Button = (props: {
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    size?: "small" | "medium" | "large";
}) => {
    let className = `${style.button} ${props.className ?? ""}`;
    if (props.size === "small") {
        className += ` ${style.small}`;
    } else if (props.size === "large") {
        className += ` ${style.large}`;
    }
    return (
        <button
            className={className}
            onClick={props.onClick}
            type={props.type ?? "button"}
        >
            {props.children}
        </button>
    );
};
