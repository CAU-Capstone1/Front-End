import type { ReactNode } from "react";
import { NavLink } from "react-router";

//버튼 컴포넌트가 뭐뭐 받을지 규칙 정해두는 것
interface ButtonProps {
    toWhere: string; //경로
    className: string;
    children: ReactNode; //내용물
}

function Button({ toWhere, className, children }: ButtonProps) {
    return (
        <NavLink
            to={toWhere}
            className={`
            bg-yellow-400
            hover:bg-yellow-300
             text-white
             font-semibold
             text-l
             rounded-xl
             shadow-md
             transition duration-75
             ${className ?? ""}
             /* 내가 입력한 className이랑 합치기 -> px py 로 가로세로 크기 조정하시오*/
    `}>
            {children}
        </NavLink >
    );
}

export default Button;

