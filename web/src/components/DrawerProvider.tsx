import {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface DrawerContextProps {
  isOpen: boolean;
  setIsOpen: (value: SetStateAction<boolean>) => void;
}

const DrawerContext = createContext<DrawerContextProps>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return [context.isOpen, context.setIsOpen] as const;
};

export const DrawerProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log(isOpen);
  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
