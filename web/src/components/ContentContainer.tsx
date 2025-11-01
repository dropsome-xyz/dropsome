import Text from "./Text";
import NavElement from "./nav-element";
import { useDrawer } from "./DrawerProvider";
interface Props {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useDrawer();
  return (
    <div className="flex-1 drawer min-h-0">
      <input
        id="my-drawer"
        checked={isOpen}
        type="checkbox"
        onChange={(e) => setIsOpen(e.target.checked)}
        className="drawer-toggle"
      />
      <div className="drawer-content flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      {/* SideBar / Drawer */}
      <aside className="drawer-side font-orbitron">
        <label htmlFor="my-drawer" className="drawer-overlay gap-6"></label>

        <ul className="p-4 overflow-y-auto menu w-80 bg-base-100 gap-10 sm:flex items-center">
          <li>
            <Text
              variant="heading"
              className="font-extrabold tracking-tighter text-center text-nova mt-10"
            >
              Menu
            </Text>
          </li>
          <li>
            <NavElement label="Drop" href="/" navigationStarts={() => setIsOpen(false)} />
          </li>
          <li>
            <NavElement label="Refund" href="/refund" navigationStarts={() => setIsOpen(false)} />
          </li>
        </ul>
      </aside>
    </div>
  );
};
