import { NavLink } from "react-router";

function MainPage() {
    return (
        <div>
            <div><NavLink to='/about'>About</NavLink></div>
            <div>Main Page</div>
        </div>
    );
}

export default MainPage;