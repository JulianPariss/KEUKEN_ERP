import Link from "next/link";

const PageRefused = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-y-5">
            <i className="dx-icon-eyeclose !text-[200px] !text-focus-500/20" />
            <p className="text-2xl font-bold text-main/60">No tienes permiso para acceder a esta página</p>
            <Link href="/" className="text-focus-500 !text-lg ">
                <i className="dx-icon-arrowleft !text-md mr-2" />
                Volver al inicio
            </Link>
        </div>
    );
}

export default PageRefused;