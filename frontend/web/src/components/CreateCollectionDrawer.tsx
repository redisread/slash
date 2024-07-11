import { Button, DialogActions, DialogContent, DialogTitle, Drawer, Input, ModalClose, Radio, RadioGroup } from "@mui/joy";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useLoading from "@/hooks/useLoading";
import { useCollectionStore, useShortcutStore, useWorkspaceStore } from "@/stores";
import { Collection } from "@/types/proto/api/v1/collection_service";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { convertVisibilityFromPb } from "@/utils/visibility";
import Icon from "./Icon";
import ShortcutView from "./ShortcutView";

interface Props {
  collectionId?: number;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  collectionCreate: Collection;
}

const CreateCollectionDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, collectionId } = props;
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();
  const collectionStore = useCollectionStore();
  const shortcutList = useShortcutStore().getShortcutList();
  const [state, setState] = useState<State>({
    collectionCreate: Collection.fromPartial({
      visibility: Visibility.PRIVATE,
    }),
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedShortcuts, setSelectedShortcuts] = useState<Shortcut[]>([]);
  const isCreating = isUndefined(collectionId);
  const loadingState = useLoading(!isCreating);
  const requestState = useLoading(false);
  const unselectedShortcuts = shortcutList
    .filter((shortcut) => {
      if (!( searchTerm === null || searchTerm === undefined || searchTerm.trim() === "")) {
        return shortcut.title.toLowerCase().includes(searchTerm.toLowerCase())
        || shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ;
      }
      if (state.collectionCreate.visibility === Visibility.PUBLIC) {
        return shortcut.visibility === Visibility.PUBLIC;
      } else if (state.collectionCreate.visibility === Visibility.WORKSPACE) {
        return shortcut.visibility === Visibility.PUBLIC || shortcut.visibility === Visibility.WORKSPACE;
      } else {
        return true;
      }
    })
    .filter((shortcut) => !selectedShortcuts.find((selectedShortcut) => selectedShortcut.id === shortcut.id));

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  useEffect(() => {
    if (workspaceStore.setting.defaultVisibility !== Visibility.VISIBILITY_UNSPECIFIED) {
      setPartialState({
        collectionCreate: Object.assign(state.collectionCreate, {
          visibility: workspaceStore.setting.defaultVisibility,
        }),
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (collectionId) {
        const collection = await collectionStore.getOrFetchCollectionById(collectionId);
        if (collection) {
          setState({
            ...state,
            collectionCreate: Object.assign(state.collectionCreate, {
              ...collection,
            }),
          });
          setSelectedShortcuts(
            collection.shortcutIds
              .map((shortcutId) => shortcutList.find((shortcut) => shortcut.id === shortcutId))
              .filter(Boolean) as Shortcut[],
          );
          loadingState.setFinish();
        }
      }
    })();
  }, [collectionId]);

  if (loadingState.isLoading) {
    return null;
  }

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        name: e.target.value.replace(/\s+/g, "-"),
      }),
    });
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        title: e.target.value,
      }),
    });
  };

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        visibility: e.target.value,
      }),
    });
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        description: e.target.value,
      }),
    });
  };

  const handleSaveBtnClick = async () => {
    if (!state.collectionCreate.name || !state.collectionCreate.title) {
      toast.error("Please fill in required fields.");
      return;
    }
    if (selectedShortcuts.length === 0) {
      toast.error("Please select at least one shortcut.");
      return;
    }

    try {
      if (!isCreating) {
        await collectionStore.updateCollection(
          {
            id: collectionId,
            name: state.collectionCreate.name,
            title: state.collectionCreate.title,
            description: state.collectionCreate.description,
            visibility: state.collectionCreate.visibility,
            shortcutIds: selectedShortcuts.map((shortcut) => shortcut.id),
          },
          ["name", "title", "description", "visibility", "shortcut_ids"],
        );
      } else {
        await collectionStore.createCollection({
          ...state.collectionCreate,
          shortcutIds: selectedShortcuts.map((shortcut) => shortcut.id),
        });
      }

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
  };

  const handleSearchTermInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setSearchTerm(e.target.value);
  };

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <DialogTitle>{isCreating ? "Create Collection" : "Edit Collection"}</DialogTitle>
      <ModalClose />
      <DialogContent className="w-full max-w-full">
        <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="The memorable name of the collection"
              value={state.collectionCreate.name}
              onChange={handleNameInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Title <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="A short title to describe your collection"
                value={state.collectionCreate.title}
                onChange={handleTitleInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Description</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="A slightly longer description"
                value={state.collectionCreate.description}
                onChange={handleDescriptionInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Visibility</span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.collectionCreate.visibility} onChange={handleVisibilityInputChange}>
                <Radio value={Visibility.PRIVATE} label={t(`shortcut.visibility.private.self`)} />
                <Radio value={Visibility.WORKSPACE} label={t(`shortcut.visibility.workspace.self`)} />
                <Radio value={Visibility.PUBLIC} label={t(`shortcut.visibility.public.self`)} />
              </RadioGroup>
            </div>
            <p className="mt-3 text-sm text-gray-500 w-full bg-gray-100 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 px-2 py-1 rounded-md">
              {t(`shortcut.visibility.${convertVisibilityFromPb(state.collectionCreate.visibility).toLowerCase()}.description`)}
            </p>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <p className="mb-2">
              <span>Shortcuts</span>
              <span className="opacity-60">({selectedShortcuts.length})</span>
              {selectedShortcuts.length === 0 && <span className="ml-2 italic opacity-80 text-sm">(Select a shortcut first)</span>}
            </p>
            <Input
              className="w-full"
              type="text"
              placeholder="Search for shortcuts"
              startDecorator={<Icon.Search className="w-4 h-auto" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="w-full py-1 px-px flex flex-row justify-start items-start flex-wrap overflow-hidden gap-2">
              {selectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutView
                    key={shortcut.id}
                    className="!w-auto select-none max-w-[40%] cursor-pointer bg-gray-100 shadow dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts.filter((selectedShortcut) => selectedShortcut.id !== shortcut.id)]);
                    }}
                  />
                );
              })}
              {unselectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutView
                    key={shortcut.id}
                    className="!w-auto select-none max-w-[40%] border-dashed cursor-pointer"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts, shortcut]);
                    }}
                  />
                );
              })}
              {selectedShortcuts.length + unselectedShortcuts.length === 0 && (
                <div className="w-full flex flex-row justify-center items-center text-gray-400">
                  <Icon.PackageOpen className="w-6 h-auto" />
                  <p className="ml-2">No shortcuts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
          <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
            {t("common.save")}
          </Button>
        </div>
      </DialogActions>
    </Drawer>
  );
};

export default CreateCollectionDrawer;
