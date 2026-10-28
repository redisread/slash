import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { showCommonDialog } from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from "@/components/ui/sheet";
import useLoading from "@/hooks/useLoading";
import { useShortcutStore } from "@/stores";
import { getShortcutUpdateMask } from "@/stores/shortcut";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
  shortcutList: Shortcut[];
}

const BatchUpdateShortcutDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, shortcutList } = props;
  const { t } = useTranslation();
  const shortcutStore = useShortcutStore();
  const requestState = useLoading(false);

  const [tags, setTags] = useState<string>("");
  const [override, setOverride] = useState<boolean>(false);

  const [deteteTags, setDeleteTags] = useState<string>("");

  const handleBatchUpdate = () => {
    if (shortcutList && shortcutList.length > 0) {
      const total = shortcutList.length;
      const tagList = tags.trim().split(" ");
      const updateOpt = override ? "override" : "update";
      showCommonDialog({
        title: "update Shortcut",
        content: `Are you sure to ${updateOpt} ${total} shortcuts tags to [#${tagList.join(", #")}]?`,
        style: "default",
        onConfirm: async () => {
          shortcutList.forEach(async (shortcut) => {
            const sTags = new Set<string>(shortcut.tags);
            for (const tag of tagList) {
              sTags.add(tag);
            }
            const newTags = Array.from(sTags);
            const originShortcut = shortcutStore.getShortcutById(shortcut.id);
            const updatingShortcut = {
              ...shortcut,
              id: shortcut.id,
              tags: override ? tagList : newTags,
            };
            await shortcutStore.updateShortcut(updatingShortcut, getShortcutUpdateMask(originShortcut, updatingShortcut));
          });
          toast.success(`成功更新${total}个Slash!`);
          if (onConfirm) {
            onConfirm();
          } else {
            onClose();
          }
        },
      });
      return;
    }
    toast.error("No shortcuts need to update");
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleBatchDelete = () => {
    if (shortcutList && shortcutList.length > 0) {
      const tagList = deteteTags.trim().split(" ");
      const total = shortcutList.length;
      if (tagList.length === 0) {
        toast.error("No tags to delete");
        return;
      }

      showCommonDialog({
        title: "update Shortcut for delete tags",
        content: `Are you sure to delete ${total} shortcuts's tags for [#${tagList.join(", #")}]?`,
        style: "default",
        onConfirm: async () => {
          shortcutList.forEach(async (shortcut) => {
            const sTags = new Set<string>(shortcut.tags);
            for (const tag of tagList) {
              sTags.delete(tag);
            }
            const newTags = Array.from(sTags);
            const originShortcut = shortcutStore.getShortcutById(shortcut.id);
            const updatingShortcut = {
              ...shortcut,
              id: shortcut.id,
              tags: newTags,
            };
            await shortcutStore.updateShortcut(updatingShortcut, getShortcutUpdateMask(originShortcut, updatingShortcut));
          });
          toast.success(`成功更新${total}个Slash!`);
          if (onConfirm) {
            onConfirm();
          } else {
            onClose();
          }
        },
      });
      return;
    }
    toast.error("No shortcuts to delete tags");
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleOverideCheckBoxClick = (checked: boolean | "indeterminate") => {
    setOverride(checked === true);
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleDeleteTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteTags(e.target.value);
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>批量更新</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
            <div className="flex flex-row space-x-2">
              <p>添加/修改标签:</p>
              <label className="flex items-center gap-2">
                <Checkbox checked={override} onCheckedChange={handleOverideCheckBoxClick} />
                是否覆盖
              </label>
            </div>
            <Input placeholder="输入批量更新的标签...(使用空格分隔)" onChange={handleTagsInputChange} value={tags} />
          </div>

          <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
            <p>删除标签:</p>
            <Input placeholder="输入批量删除的标签...(使用空格分隔)" onChange={handleDeleteTagsInputChange} value={deteteTags} />
          </div>
        </SheetBody>
        <SheetFooter>
          <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
            <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={requestState.isLoading} onClick={handleBatchUpdate}>
              更新tag
            </Button>
            <Button variant="destructive" disabled={requestState.isLoading} onClick={handleBatchDelete}>
              删除tag
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
export default BatchUpdateShortcutDrawer;
