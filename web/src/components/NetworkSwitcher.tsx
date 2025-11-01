import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';

const NetworkSwitcher: FC = () => {
  const { networkConfiguration, setNetworkConfiguration, customRpcUrl, setCustomRpcUrl } = useNetworkConfiguration();
  const [showCustomInput, setShowCustomInput] = useState(false);

  console.log(networkConfiguration);

  const handleNetworkChange = (network: string) => {
    setNetworkConfiguration(network);
    setShowCustomInput(network === 'custom');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer label">
        <a>Network</a>
        <select
          value={networkConfiguration}
          onChange={(e) => handleNetworkChange(e.target.value)}
          className="select max-w-xs"
        >
          <option value="mainnet-beta">main</option>
          <option value="custom">custom</option>
        </select>
      </label>
      
      {(networkConfiguration === 'custom' || showCustomInput) && (
        <label className="label">
          <span className="label-text">Custom RPC URL</span>
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