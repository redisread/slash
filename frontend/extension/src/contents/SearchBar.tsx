
import React, { useState, useEffect } from "react";
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoCSUIProps,
  PlasmoRender
} from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"

import type { FC } from "react"
import { createRoot } from "react-dom/client"

import "../style.css";

export const config: PlasmoCSConfig = {
  matches: ["https://www.baidu.com/*"]
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const rootContainer = document.createElement("div")
    rootContainer.style.position = "fixed"
    rootContainer.style.top = "50%"
    rootContainer.style.left = "50%"
    rootContainer.style.transform = "translate(-50%, -50%)"
    rootContainer.style.zIndex = "9999"
    document.body.appendChild(rootContainer)
    resolve(rootContainer)
  })

const CentralSearch: FC<PlasmoCSUIProps> = () => {
  const [searchText, setSearchText] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里可以添加搜索逻辑
    console.log("Searching for:", searchText)
  }

  return (
    <div style={{
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="输入搜索内容..."
          style={{
            padding: "10px",
            width: "300px",
            fontSize: "16px"
          }}
        />
        <button type="submit" style={{
          marginLeft: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          搜索
        </button>
      </form>
    </div>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  createRootContainer
}) => {
  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<CentralSearch />)
}

export default CentralSearch