import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { parseBookmarks, generateRandomName } from "@/helpers/fileParse";
import useLoading from "@/hooks/useLoading";
import { useShortcutStore } from "@/stores";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
  shortcutList: Shortcut[];
}

interface ImportBookmarkState {
  processedContent: boolean;
  processedBookmarkNums: number;
  existNum: number;
}

const ImportBookmarkDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, shortcutList } = props;

  const { t } = useTranslation();
  const shortcutStore = useShortcutStore();
  const requestState = useLoading(false);
  //   const loadingState = useLoading(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [state, setState] = useState<ImportBookmarkState>({
    processedContent: false,
    processedBookmarkNums: 0,
    existNum: 0,
  });

  // 部分更新
  const setPartialState = (partialState: Partial<ImportBookmarkState>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const bookmarks = parseBookmarks(content);
        if (!bookmarks || bookmarks.length === 0) {
          toast.error("No bookmarks found in the file.");
          return;
        }
        const shortcuts: Shortcut[] = bookmarks.map((bookmark) => {
          return Shortcut.fromPartial({
            name: generateRandomName(),
            title: bookmark.title,
            link: bookmark.url,
            tags: bookmark.tags,
            visibility: Visibility.PUBLIC,
            ogMetadata: {
              title: "",
              description: "",
              image: "",
            },
          });
        });

        const existShortcutListMap = new Map<string, Shortcut>();
        shortcutList.forEach((shortcut) => {
          existShortcutListMap.set(shortcut.link, shortcut);
        });
        let existNum = 0;
        let createNum = 0;
        shortcuts.forEach((shortcut) => {
          // 如果存在则条跳过，针对导入书签的情况
          if (existShortcutListMap.has(shortcut.link)) {
            existNum++;
          } else {
            // 不存在才创建
            void shortcutStore.createShortcut(shortcut);
            createNum++;
          }
        });
        console.log("createNum", createNum, " existNum", existNum);
        setPartialState({
          processedContent: true,
          processedBookmarkNums: createNum,
          existNum: existNum,
        });
        toast.success("createNum:" + createNum + " existNum:" + existNum);
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>导入浏览器书签</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
            <div className="space-y-3">
              <label htmlFor="bookmarks-file">选择 HTML 书签文件</label>
              <p>URL 已存在时会跳过</p>
              <Input id="bookmarks-file" type="file" accept=".html" onChange={handleFileChange} />
            </div>

            {state.processedContent && (
              <>
                <h3>结果</h3>
                <p>
                  导入书签成功 处理总数:{state.processedBookmarkNums} 跳过数:{state.existNum}
                </p>
              </>
            )}
          </div>
        </SheetBody>
        <SheetFooter>
          <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
            <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={requestState.isLoading || !selectedFile} onClick={handleUpload}>
              解析
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ImportBookmarkDrawer;
