import { Button, Input, CssVarsProvider, Divider, IconButton } from "@mui/joy";
import { Storage } from "@plasmohq/storage";
import { useEffect, useState ,useRef} from "react";
import { Toaster } from "react-hot-toast";
import CreateShortcutButton from "@/components/CreateShortcutButton";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import PullShortcutsButton from "@/components/PullShortcutsButton";
import ShortcutsContainer from "@/components/ShortcutsContainer";
import { useShortcutStore } from "@/stores";
import Dropdown from "./components/Dropdown";
import ShortcutView from "./components/ShortcutView";
import { StorageContextProvider, useStorageContext } from "./context";
import useColorTheme from "./hooks/useColorTheme";
import "./style.css";
import type { KeyboardEvent } from 'react';
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";

const storage = new Storage();

const IndexPopup = () => {
  useColorTheme();
  const context = useStorageContext();
  const shortcutStore = useShortcutStore();
  const shortcuts = shortcutStore.getShortcutList();
  const isInitialized = context.instanceUrl && context.accessToken;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState("Shortcuts");
  const [searchShortcuts, setSearchShortcuts] = useState<Shortcut[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    shortcutStore.fetchShortcutList(context.instanceUrl, context.accessToken);
  }, [isInitialized]);

  useEffect(() => {
    const shouldOpenSearch = storage.get("openSearch");
    if (shouldOpenSearch) {
      setSelectedSection("Search");
      storage.remove("openSearch");
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      // 取消选中
      setSelectedIndex(-1);
      if (searchTerm.trim() === "") {
        setSearchShortcuts([]);
        return;
      }
      try {
        const termList = searchTerm.split(" ");
        const searchResult = shortcuts.filter((shortcut) => {
          const title = shortcut.title.toLocaleLowerCase();
          for (const t of termList) {
            if (!title.includes(t.toLocaleLowerCase())) {
              return false; // 如果title不包含termList中的某个项，立即返回false
            }
          }
          return true; 
        });
        setSearchShortcuts(searchResult);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);


  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => (prev < searchShortcuts.length - 1 ? prev + 1 : prev));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
        event.preventDefault();
        const shortcutLink = `${context.instanceUrl}/s/${searchShortcuts[selectedIndex].name}`;
        window.open(shortcutLink, '_blank');
      }
  };



  const handleSettingButtonClick = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleRefreshButtonClick = () => {
    chrome.runtime.reload();
    chrome.browserAction.setPopup({ popup: "" });
  };

  return (
    <div className="w-full min-w-[512px] px-4 pt-4">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start items-center dark:text-gray-400">
          <Logo className="w-6 h-auto mr-1" />
          <span className="">Slash</span>
          {isInitialized && (
            <>
              <span className="font-mono opacity-60 mx-1 dark:text-gray-400">/</span>
              <Dropdown
                trigger={
                  <button className="flex flex-row justify-end items-center cursor-pointer">
                    <span className="dark:text-gray-400">{selectedSection}</span>
                    <Icon.ChevronsUpDown className="ml-1 w-4 h-auto text-gray-600 dark:text-gray-400" />
                  </button>
                }
                actionsClassName="!w-36 -left-4 z-50"
                actions={
                  <>
                    <IconButton
                      className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => setSelectedSection("Shortcuts")}
                    >
                      <Icon.SquareSlash className="w-5 h-auto mr-2 opacity-70" /> Shortcuts
                    </IconButton>
                    <IconButton
                      className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => setSelectedSection("Search")}
                    >
                      <Icon.Search className="w-5 h-auto mr-2 opacity-70" /> Search
                    </IconButton>
                  </>
                }
              ></Dropdown>
              {selectedSection === "Shortcuts" && (
                <>
                  <span className="text-gray-500 mr-0.5">({shortcuts.length})</span>
                  <PullShortcutsButton />
                </>
              )}
            </>
          )}
        </div>
        <div>{isInitialized && selectedSection === "Shortcuts" && <CreateShortcutButton />}</div>
      </div>

      <div className="w-full mt-4">
        {isInitialized ? (
          selectedSection === "Search" ? (
            <div className="flex flex-col justify-start items-center">
              <Input
                className="w-full mr-3 mb-4"
                type="text"
                size="sm"
                placeholder="Search..."
                startDecorator={<Icon.Search className="w-4 h-auto" />}
                value={searchTerm}
                autoFocus
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {searchShortcuts.length !== 0 ? (
                <div ref={resultsRef} className="w-full flex flex-col justify-start items-start gap-2">
                  {searchShortcuts.map((shortcut,index) => {
                    return <ShortcutView key={shortcut.id} shortcut={shortcut} selected={selectedIndex === index}/>;
                  })}
                </div>
              ) : (
                <div className="w-full flex flex-col justify-center items-center">
                  <p>No shortcut found.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {shortcuts.length !== 0 ? (
                <ShortcutsContainer limit={10} />
              ) : (
                <div className="w-full flex flex-col justify-center items-center">
                  <p>No shortcut found.</p>
                </div>
              )}

              <Divider className="!mt-4 !mb-2 opacity-40" />

              <div className="w-full flex flex-row justify-between items-center mb-2">
                <div className="flex flex-row justify-start items-center">
                  <IconButton size="sm" variant="plain" color="neutral" onClick={handleSettingButtonClick}>
                    <Icon.Settings className="w-5 h-auto text-gray-500 dark:text-gray-400" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    component="a"
                    href="https://github.com/yourselfhosted/slash"
                    target="_blank"
                  >
                    <Icon.Github className="w-5 h-auto text-gray-500 dark:text-gray-400" />
                  </IconButton>
                </div>
                <div className="flex flex-row justify-end items-center">
                  <a
                    className="text-sm flex flex-row justify-start items-center underline text-blue-600 hover:opacity-80"
                    href={context.instanceUrl}
                    target="_blank"
                  >
                    <span className="mr-1">Go to my Slash</span>
                    <Icon.ExternalLink className="w-4 h-auto" />
                  </a>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="w-full flex flex-col justify-start items-center">
            <Icon.Cookie strokeWidth={1} className="w-20 h-auto mb-4 text-gray-400" />
            <p className="dark:text-gray-400">Please set your instance URL and access token first.</p>
            <div className="w-full flex flex-row justify-center items-center py-4">
              <Button size="sm" color="primary" onClick={handleSettingButtonClick}>
                <Icon.Settings className="w-5 h-auto mr-1" /> Go to Setting
              </Button>
              <span className="mx-2 dark:text-gray-400">Or</span>
              <Button size="sm" variant="outlined" color="neutral" onClick={handleRefreshButtonClick}>
                <Icon.RefreshCcw className="w-5 h-auto mr-1" /> Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Popup = () => {
  return (
    <StorageContextProvider>
      <CssVarsProvider>
        <IndexPopup />
        <Toaster position="top-center" />
      </CssVarsProvider>
    </StorageContextProvider>
  );
};

export default Popup;