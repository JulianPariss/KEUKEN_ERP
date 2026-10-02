import Link from "next/link";

const GlobalNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen gap-y-5 bg-primary-950">
            <i className="dx-icon-warning !text-[200px] !text-focus-500/20" />
            <p className="text-2xl font-bold text-main/60">404 - Página no encontrada</p>
            <p className="text-lg text-main/40 text-center">La ruta que intentas acceder no existe o fue movida.</p>
            <Link href="/" className="text-focus-500 !text-lg ">
                <i className="dx-icon-arrowleft !text-md mr-2" />
                Volver al inicio
            </Link>
        </div>
    );
}

export default GlobalNotFound;
