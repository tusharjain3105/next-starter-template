import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

export interface GlobalStorage {}

const initialData: GlobalStorage = {
  routeChange: {
    isLoading: false,
  },
};

const GlobalContext = createContext<
  [GlobalStorage, Dispatch<SetStateAction<GlobalStorage>>]
>(null as any);

const GlobalProvider = ({ children }: PropsWithChildren) => {
  const state = useState(initialData);

  return (
    <GlobalContext.Provider value={state}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;

const useGlobal = () => use(GlobalContext);

export type Selector<T = any> = (globalData: GlobalStorage) => T;
export const useSelector = <T,>(selector: Selector<T>) => {
  const [globalData] = useGlobal();
  const data = selector(globalData);
  const [cachedData, setCachedData] = useState<T>(data);

  useEffect(() => setCachedData(data), [data]);

  return cachedData;
};

export type Dispatcher = (globalData: GlobalStorage) => void;
export let dispatch: (d: Dispatcher) => void;
export const useDispatch = () => {
  const [globalData, setGlobalData] = useGlobal();

  const _dispatch = useCallback(
    (dispatcher?: Dispatcher) => {
      let finalData = globalData;
      dispatcher?.(globalData);
      setGlobalData({ ...finalData });
    },
    [globalData, setGlobalData],
  );

  dispatch = _dispatch;
  return _dispatch;
};
