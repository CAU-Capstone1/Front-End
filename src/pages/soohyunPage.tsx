import { NavLink } from "react-router";

function AboutPage() {
    return (
        <div>
            <div>soohyun Page</div>
            <div><NavLink to='/about'>about</NavLink></div>
            <div><NavLink to='/'>Main</NavLink></div>
        </div>
    );
}

export default AboutPage;