import { NavLink } from "react-router";

function MainPage() {
    return (
        <div>
            어서오세요 <br /> 지금부터 음악을 만들어볼까요 ? 👽
            <div><NavLink to='/what1'>허밍 올리는 버튼</NavLink></div>
        </div >
    );
}

export default MainPage;