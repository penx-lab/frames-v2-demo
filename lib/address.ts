import { NETWORK, NetworkNames } from './constants';


const baseSepoliaAddress = {
  SpaceFactory: '0x2728B1E9cEf2d2278EB7C951a553D0E5a6aE45d0',
  CreationFactory: '0xB2ebC5f85E0DA834CB71884150d2Fd738fEf918B',
  PenToken: '0x76F58Cd6fb70ed025dcfE1745b0eFD53dbCC46db',
  Tip: '0xcbbF51AAe2E379b0C819343d0032D61e3E62dcCB',
  DailyClaim: '0x9F012858826Bcd85d553370F910955d0704f3250',
  TokenVesting: '0x317fA05239db961cBEa4eDc31CD283FA5308e182'
}

const baseAddress = {
  SpaceFactory: '0x692C2493Dd672eA3D8515C193e4c6E0788972115',
  CreationFactory: '0xB9563EBeDE644956FB4d8EFE40440bAeA8da342D',
  PenToken: '0x85cDc12064607BDb135f67068b1675479391e32D',
  Tip: '0x9a37779f70a25B09BC5F075576b3C9C0c6caEbB1',
  DailyClaim: '0x56C4951a4813392ed2248fd316991a2771Ca4F3A',
  TokenVesting: '0x23058709c2c50F31a77c94855fC71B42B9d28949'
}

export const addressMap: Record<keyof typeof baseSepoliaAddress, any> =
  (function () {
    if (NETWORK === NetworkNames.BASE_SEPOLIA) {
      return baseSepoliaAddress
    }
    if (NETWORK === NetworkNames.BASE) {
      return baseAddress
    }
    return baseAddress
  })()

export const ADDRESS_TO_CONTRACT = new Map(
  Object.entries(addressMap).map(([contract, address]) => [address, contract]),
)