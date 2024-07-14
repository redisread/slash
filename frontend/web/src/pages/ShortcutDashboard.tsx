import { Button, Input } from "@mui/joy";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useLocalStorage from "react-use/lib/useLocalStorage";
import CreateShortcutDrawer from "@/components/CreateShortcutDrawer";
import FilterView from "@/components/FilterView";
import Icon from "@/components/Icon";
import ImportBookmarkDrawer from "@/components/ImportBookmarkDrawer";
import ShortcutsContainer from "@/components/ShortcutsContainer";
import ShortcutsNavigator from "@/components/ShortcutsNavigator";
import ViewSetting from "@/components/ViewSetting";
import useLoading from "@/hooks/useLoading";
import { useShortcutStore, useUserStore, useViewStore } from "@/stores";
import { getFilteredShortcutList, getOrderedShortcutList } from "@/stores/view";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import {toast} from "react-hot-toast";


interface State {
  showCreateShortcutDrawer: boolean;
}

const ShortcutDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [, setLastVisited] = useLocalStorage<string>("lastVisited", "/shortcuts");
  const loadingState = useLoading();
  const currentUser = useUserStore().getCurrentUser();
  const shortcutStore = useShortcutStore();
  const viewStore = useViewStore();
  const shortcutList = shortcutStore.getShortcutList();
  const [state, setState] = useState<State>({
    showCreateShortcutDrawer: false,
  });
  const [showImportBookmarkDrawer, setShowImportBookmarkDrawer] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [confirmDeleteShortcutIds,setConfirmDeleteShortcutIds] = useState<Set<number>>(new Set());

  const filter = viewStore.filter;
  const filteredShortcutList = getFilteredShortcutList(shortcutList, filter, currentUser);
  const orderedShortcutList = getOrderedShortcutList(filteredShortcutList, viewStore.order);

  useEffect(() => {
    setLastVisited("/shortcuts");
    Promise.all([shortcutStore.fetchShortcutList()]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  const setShowCreateShortcutDrawer = (show: boolean) => {
    setState({
      ...state,
      showCreateShortcutDrawer: show,
    });
  };


  const exportShortcuts2Json = () => {
    console.log("shortcutList size: " + shortcutList.length);
    const jsonString = JSON.stringify(shortcutList, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "slash_data.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  const handleDelete = () => {
    let total = 0;
    if (confirmDeleteShortcutIds && confirmDeleteShortcutIds.size > 0) {
      total = confirmDeleteShortcutIds.size;
      confirmDeleteShortcutIds.forEach((id) => {
        shortcutStore.deleteShortcut(id);
      })
    }
    toast.success(`成功删除${total}个Slash!`);
    setConfirmDeleteShortcutIds(new Set());
    setIsConfirmDelete(false);
  }


  const handleShortcutConfirmDelete = (shortcut: Shortcut) => {
    let newSet = new Set(confirmDeleteShortcutIds);
    if (newSet.has(shortcut.id)) {
      newSet.delete(shortcut.id);
    } else {
      newSet.add(shortcut.id);
    }
    setConfirmDeleteShortcutIds(newSet);
  }


  return (
    <>
      <div className="mx-auto max-w-8xl w-full px-4 sm:px-6 md:px-12 pt-4 pb-6 flex flex-col justify-start items-start">
        <ShortcutsNavigator />
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-start items-center">
            <Input
              className="w-32 mr-2"
              type="text"
              size="sm"
              placeholder={t("common.search")}
              startDecorator={<Icon.Search className="w-4 h-auto" />}
              endDecorator={<ViewSetting />}
              value={filter.search}
              onChange={(e) => viewStore.setFilter({ search: e.target.value })}
            />
          </div>
          <div className="flex flex-row justify-end items-center space-x-2">
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => setShowCreateShortcutDrawer(true)}>
              <Icon.Plus className="w-5 h-auto" />
              <span className="ml-0.5">{t("common.create")}</span>
            </Button>
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => setShowImportBookmarkDrawer(true)}>
              <Icon.Plus className="w-5 h-auto" />
              <span className="ml-0.5">导入浏览器书签</span>
            </Button>
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => exportShortcuts2Json()}>
              <Icon.Plus className="w-5 h-auto" />
              <span className="ml-0.5">导出shortcus</span>
            </Button>
            {
              isConfirmDelete ? (
                <>
                  <Button className="hover:shadow" color="danger" variant='solid' size="sm" onClick={() => { handleDelete(); }}>
                    <Icon.Minus className="w-5 h-auto" />
                    <span className="ml-0.5">确认删除</span>
                  </Button>
                  <Button className="hover:shadow" color="danger" variant="soft" size="sm" onClick={() => setIsConfirmDelete(false)}>
                    <Icon.Minus className="w-5 h-auto" />
                    <span className="ml-0.5">取消</span>
                  </Button>
                </>
              ) : (
                <Button className="hover:shadow" color="danger" variant='soft' size="sm" onClick={() => { setIsConfirmDelete(true)}}>
                  <Icon.Minus className="w-5 h-auto" />
                  <span className="ml-0.5">删除</span>
                </Button>
              )
            }
          </div>
        </div>
        <FilterView />
        {loadingState.isLoading ? (
          <div className="py-12 w-full flex flex-row justify-center items-center opacity-80 dark:text-gray-500">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            {t("common.loading")}
          </div>
        ) : orderedShortcutList.length === 0 ? (
          <div className="py-16 w-full flex flex-col justify-center items-center text-gray-400">
            <Icon.PackageOpen className="w-16 h-auto" strokeWidth="1" />
            <p className="mt-4">No shortcuts found.</p>
          </div>
        ) : (
          <ShortcutsContainer shortcutList={orderedShortcutList} isDeleteMode={isConfirmDelete} confirmDeleteShortcutIds={confirmDeleteShortcutIds} onShortcutConfirmDelete={handleShortcutConfirmDelete}/>
        )}
      </div>

      {state.showCreateShortcutDrawer && (
        <CreateShortcutDrawer onClose={() => setShowCreateShortcutDrawer(false)} onConfirm={() => setShowCreateShortcutDrawer(false)} />
      )}
      {showImportBookmarkDrawer && (
        <ImportBookmarkDrawer onClose={() => setShowImportBookmarkDrawer(false)} onConfirm={() => setShowImportBookmarkDrawer(false)} />
      )}
    </>
  );
};

export default ShortcutDashboard;