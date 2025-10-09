import type { ReactNode } from "react";
import { NavLink } from "react-router";

//버튼 컴포넌트가 뭐뭐 받을지 규칙 정해두는 것
type ButtonProps = {
    toWhere: string; //경로
    children: ReactNode; //내용물
    onClick?: () => void;
}

function Button({ toWhere, children, onClick }: ButtonProps) {
    return (
        <NavLink
            to={toWhere}
            onClick={onClick}

            className="bg-yellow-400
            hover:bg-yellow-300
             text-white
             font-semibold
             text-l
             px-5 py-4
             rounded-xl
             shadow-md
             transition duration-75
             ">
            {children}
        </NavLink>
    );
}

export default Button;

