import pkg from "../../../package.json";
import { FC } from "react";
import { Drop } from "../../components/Drop";
import { Logo } from "../../components/Logo";

export const DropView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
          <div className="flex justify-center mb-2 md:hidden font-orbitron">
            <Logo />
          </div>
          <div className="text-sm font-orbitron font-normal align-bottom text-right text-slate-600 mt-4">v{pkg.version}</div>
          <h1 className="text-center text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-br from-triton to-vortex m-4">
            Drop some SOL
          </h1>
          <div className="text-center">
            <Drop />
          </div>
        </div>
      </div>
    </div>
  );
};
