import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';
import { useTranslation } from "react-i18next";

const NetworkSwitcher: FC = () => {
  const { networkConfiguration, setNetworkConfiguration, customRpcUrl, setCustomRpcUrl } = useNetworkConfiguration();
  const { t } = useTranslation('common');
  const [showCustomInput, setShowCustomInput] = useState(false);
  console.log(networkConfiguration);

  const handleNetworkChange = (network: string) => {
    setNetworkConfiguration(network);
    setShowCustomInput(network === 'custom');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer label">
        <a>{t('network.label')}</a>
        <select
          value={networkConfiguration}
          onChange={(e) => handleNetworkChange(e.target.value)}
          className="select select-sm bg-base-100 text-base-content w-38 border-none focus:border-vortex focus:ring-0 focus:outline-none"
        >
          <option value="mainnet-beta">mainnet</option>
          <option value="custom">{t('network.custom')}</option>
        </select>
      </label>

      {(networkConfiguration === 'custom' || showCustomInput) && (
        <label className="label">
          <span className="label-text">{t('network.customRpcUrl')}</span>
          <input
            type="text"
            placeholder="http://localhost:8899"
            value={customRpcUrl}
            onChange={(e) => setCustomRpcUrl(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </label>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(NetworkSwitcher), {
  ssr: false
})
