import { BitSwitchesWidget } from './BitSwitchesWidget';
import { SpecialRangesWidget } from './SpecialRangesWidget';
import { CidrSliderWidget } from './CidrSliderWidget';
import { BoxPracticeWidget } from './BoxPracticeWidget';
import { FlsmPracticeWidget } from './FlsmPracticeWidget';
import { VlsmPracticeWidget } from './VlsmPracticeWidget';
import { SummarizePracticeWidget } from './SummarizePracticeWidget';
import { Ipv6NibbleWidget } from './Ipv6NibbleWidget';

interface Props {
  type: string;
}

export function ModuleInteractivePractice({ type }: Props) {
  switch (type) {
    case 'bit-switches':
      return <BitSwitchesWidget />;
    case 'special-ranges':
      return <SpecialRangesWidget />;
    case 'cidr-slider':
      return <CidrSliderWidget />;
    case 'box-4th':
      return <BoxPracticeWidget />;
    case 'floors-3rd':
      return (
        <BoxPracticeWidget
          defaultIp="172.16.67.85"
          defaultPrefix={22}
          presets={[
            { label: '172.16.67.85 /22', ip: '172.16.67.85', prefix: 22 },
            { label: '10.200.173.45 /20', ip: '10.200.173.45', prefix: 20 },
            { label: '172.20.105.77 /19', ip: '172.20.105.77', prefix: 19 },
            { label: '192.168.10.50 /23', ip: '192.168.10.50', prefix: 23 },
          ]}
          title="Laboratorio Interactivo: El 3er Octeto y los Pisos (/17 a /24)"
        />
      );
    case 'architect-octets':
      return (
        <BoxPracticeWidget
          defaultIp="10.75.140.23"
          defaultPrefix={13}
          presets={[
            { label: '10.75.140.23 /13', ip: '10.75.140.23', prefix: 13 },
            { label: '10.145.200.89 /11', ip: '10.145.200.89', prefix: 11 },
            { label: '185.120.45.19 /6', ip: '185.120.45.19', prefix: 6 },
            { label: '10.0.0.1 /8', ip: '10.0.0.1', prefix: 8 },
          ]}
          title="Laboratorio Interactivo: 1er y 2do Octeto (Nivel Arquitecto)"
        />
      );
    case 'flsm-sim':
      return <FlsmPracticeWidget />;
    case 'vlsm-sim':
      return <VlsmPracticeWidget />;
    case 'summarize-sim':
      return <SummarizePracticeWidget />;
    case 'ipv6-nibbles':
      return <Ipv6NibbleWidget />;
    default:
      return null;
  }
}
