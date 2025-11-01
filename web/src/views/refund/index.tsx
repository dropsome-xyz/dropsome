
import { FC } from "react";
import { Refund } from '../../components/Refund';
import { Logo } from '../../components/Logo';

export const RefundView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="flex justify-center mt-6 md:hidden font-orbitron">
          <Logo />
        </div>
        <h1 className="text-center text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-br from-triton to-vortex m-4">
          Refund Your Drop
        </h1>
        <div className="text-center">
          <Refund />
        </div>
      </div>
    </div>
  );
};
