import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';
import { useTranslation } from "react-i18next";
import { DEFAULT_CUSTOM_RPC_URL, getSafeRpcUrl, isValidRpcUrl } from '../utils/rpc';

const RPC_UPDATE_DEBOUNCE_MS = 2000;

const NetworkSwitcher: FC = () => {
  const { networkConfiguration, setNetworkConfiguration, customRpcUrl, setCustomRpcUrl } = useNetworkConfiguration();
  const { t } = useTranslation('common');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRpcDraft, setCustomRpcDraft] = useState(customRpcUrl);

  useEffect(() => {
    setCustomRpcDraft(customRpcUrl);
  }, [customRpcUrl]);

  useEffect(() => {
    if (networkConfiguration !== 'custom' || customRpcDraft === customRpcUrl) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const safeRpcUrl = isValidRpcUrl(customRpcDraft)
        ? customRpcDraft.trim()
        : DEFAULT_CUSTOM_RPC_URL;

      setCustomRpcDraft(safeRpcUrl);
      setCustomRpcUrl(getSafeRpcUrl(customRpcDraft));
    }, RPC_UPDATE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [customRpcDraft, customRpcUrl, networkConfiguration, setCustomRpcUrl]);

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
            value={customRpcDraft}
            onChange={(e) => setCustomRpcDraft(e.target.value)}
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
