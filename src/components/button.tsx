import type { ReactNode } from "react";
import { NavLink } from "react-router";

//버튼 컴포넌트가 뭐뭐 받을지 규칙 정해두는 것
interface ButtonProps {
    toWhere: string; //경로
    children: ReactNode; //내용물
}

function Button({ toWhere, children }: ButtonProps) {
    return (
        <NavLink
            to={toWhere}
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

