import { useProgress } from '../../state/ProgressContext';
import { SubnetTab } from '../../components/calculator/SubnetTab';
import { FLSMTab } from '../../components/calculator/FLSMTab';
import { VLSMTab } from '../../components/calculator/VLSMTab';
import { SummarizationTab } from '../../components/calculator/SummarizationTab';
import { IPv6Tab } from '../../components/calculator/IPv6Tab';
import { ConverterTab } from '../../components/calculator/ConverterTab';

export function CalculatorView() {
  const { state } = useProgress();

  return (
    <div className="space-y-6 pb-12">
      {state.calculatorTab === 'subnet' && <SubnetTab />}
      {state.calculatorTab === 'flsm' && <FLSMTab />}
      {state.calculatorTab === 'vlsm' && <VLSMTab />}
      {state.calculatorTab === 'summarize' && <SummarizationTab />}
      {state.calculatorTab === 'ipv6' && <IPv6Tab />}
      {state.calculatorTab === 'converter' && <ConverterTab />}
    </div>
  );
}
