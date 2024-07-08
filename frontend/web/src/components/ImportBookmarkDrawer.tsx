import { Button, DialogActions, DialogContent, DialogTitle, Divider, Drawer, Input, ModalClose, Radio, RadioGroup, Textarea } from "@mui/joy";
import { Typography, Sheet, Stack } from "@mui/joy";
import classnames from "classnames";
import { isUndefined, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { parseBookmarks, generateRandomName } from "@/helpers/fileParse";
import useLoading from "@/hooks/useLoading";
import { useWorkspaceStore, useShortcutStore } from "@/stores";
import { getShortcutUpdateMask } from "@/stores/shortcut";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { convertVisibilityFromPb } from "@/utils/visibility";
import Icon from "./Icon";


interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

interface ImportBookmarkState {
    processedContent: boolean;
    processedBookmarkNums: number;
    existNum: number;
}

const ImportBookmarkDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm } = props;

  const { t } = useTranslation();
  const shortcutStore = useShortcutStore();
  const workspaceStore = useWorkspaceStore();
  const requestState = useLoading(false);
//   const loadingState = useLoading(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [state, setState] = useState<ImportBookmarkState>({
    processedContent: false,
    processedBookmarkNums: 0,
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

        const existShortcutList = shortcutStore.fetchShortcutList();
        const existShortcutListMap = new Map<string, Shortcut>();

        existShortcutList.then((existShortcuts) => {
          existShortcuts.forEach(shortcut => {
            existShortcutListMap.set(shortcut.link, shortcut);
          });
        });

        let existNum = 0;
        let createNum = 0;
        shortcuts.forEach((shortcut) => {
          // 如果存在则条跳过，针对导入书签的情况
          if (existShortcutListMap.has(shortcut.link)) {
            existNum ++;
          } else {
            // 不存在才创建
            const createShortcut = shortcutStore.createShortcut(shortcut);
            createNum++;
          }
        });

        console.log("res: " + JSON.stringify(shortcuts));
        setPartialState({
          processedContent: true,
          processedBookmarkNums: createNum,
          existNum: existNum,
        });
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <DialogTitle>导入浏览器书签</DialogTitle>
      <ModalClose />
      <DialogContent className="w-full max-w-full">
        <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
            
          <Sheet sx={{ maxWidth: 500, margin: "auto", padding: 3 }}>
            <Stack spacing={2}>
              <Typography level="h3">选择文件上传</Typography>
              <Button component="label" role={undefined} tabIndex={-1} variant="outlined" color="neutral">
              {selectedFile ? selectedFile.name : "Upload HTML file"}
                <input type="file" accept=".html" onChange={handleFileChange} style={{ display: "none" }} />
              </Button>
            </Stack>
          </Sheet>

          
          {state.processedContent &&
           (
            <>
            <Divider className="text-gray-500">结果</Divider>
            <p>导入书签成功 处理总数:{state.processedBookmarkNums} 跳过数:{state.existNum}</p>
            </>
           )}
          
        </div>
      </DialogContent>
      <DialogActions>
        <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
          <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" disabled={requestState.isLoading || !selectedFile} loading={requestState.isLoading} onClick={handleUpload}>
            解析
          </Button>
        </div>
      </DialogActions>
    </Drawer>
  );
};

export default ImportBookmarkDrawer;