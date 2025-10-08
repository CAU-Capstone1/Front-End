import Button from "../components/button";

function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-10">

            <div>음악 완성</div>
            <Button toWhere="/">처음으로</Button>
        </div>
    );
}

export default AboutPage;