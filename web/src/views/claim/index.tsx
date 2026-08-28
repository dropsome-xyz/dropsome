import { FC } from "react";
import { Claim } from '../../components/Claim';
import { Logo } from '../../components/Logo';
import { useTranslation } from "react-i18next";

export const ClaimView: FC = ({ }) => {
    const { t } = useTranslation('claim');

  return (
    <div className="mx-auto p-4">
      <div className="flex flex-col">
        <div className="flex justify-center mt-6 md:hidden font-orbitron">
          <Logo />
        </div>
        <h1 className="text-center text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-br from-triton to-vortex m-4">
          {t('heading')}
        </h1>
        <div className="text-center">
          <Claim />
        </div>
      </div>
    </div>
  );
};
