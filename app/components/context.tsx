import { useContext, createContext, Dispatch, SetStateAction } from "react";

export function useClockTypeContext() {
    return useContext(useClockType);
  }
  export function useSetClockTypeContext() {
    return useContext(SetClockType);
  }
  
  const SettingsClockType = useClockTypeContext();
  
//   const useClockType = createContext<SettingsClockType>('default');
//   const SetClockType = createContext<Dispatch<SetStateAction<SettingsClockType>>>(
//       (value) => {
//           console.log('Default function:', value);
//       }
//   );
  