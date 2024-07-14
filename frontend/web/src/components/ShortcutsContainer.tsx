import classNames from "classnames";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useViewStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import ShortcutCard from "./ShortcutCard";
import ShortcutView from "./ShortcutView";

interface Props {
  shortcutList: Shortcut[];
  isDeleteMode: boolean;
  confirmDeleteShortcutIds: Set<number>;
  onShortcutConfirmDelete: (shortcut: Shortcut) => void;
}

const ShortcutsContainer: React.FC<Props> = (props: Props) => {
  const { shortcutList,isDeleteMode,confirmDeleteShortcutIds, onShortcutConfirmDelete} = props;
  const navigateTo = useNavigateTo();
  const viewStore = useViewStore();
  const displayStyle = viewStore.displayStyle || "full";
  const ShortcutItemView = viewStore.displayStyle === "compact" ? ShortcutView : ShortcutCard;

  const handleShortcutClick = (shortcut: Shortcut) => {
    navigateTo(`/shortcut/${shortcut.id}`);
  };

  return (
    <div
      className={classNames(
        "w-full grid grid-cols-1 gap-3 sm:gap-4",
        displayStyle === "full" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {shortcutList.map((shortcut) => {
          return (
            <div key={shortcut.id} className="relative">
              <ShortcutItemView
                shortcut={shortcut}
                showActions={!isDeleteMode}
                onClick={() => handleShortcutClick(shortcut)}
              />
              {isDeleteMode && (
                <input
                  type="checkbox"
                  className="absolute top-1 right-2 w-5 h-5"
                  checked={confirmDeleteShortcutIds.has(shortcut.id)}
                  onChange={() => onShortcutConfirmDelete(shortcut)}
                />
              )}
            </div>
          );      })}
    </div>
  );
};

export default ShortcutsContainer;
