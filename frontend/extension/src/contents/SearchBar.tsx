
// import React, { useState, useEffect } from "react";
// import type {
//   PlasmoCSConfig,
//   PlasmoCSUIJSXContainer,
//   PlasmoCSUIProps,
//   PlasmoRender
// } from "plasmo"
// import { sendToBackground } from "@plasmohq/messaging"
// import { useMessage } from "@plasmohq/messaging/hook"

// import type { FC } from "react"
// import { createRoot } from "react-dom/client"

// import "../style.css";

// export const config: PlasmoCSConfig = {
//   matches: ["https://www.baidu.com/*"]
// }

// export const getRootContainer = () =>
//   new Promise((resolve) => {
//     const rootContainer = document.createElement("div")
//     rootContainer.style.position = "fixed"
//     rootContainer.style.top = "50%"
//     rootContainer.style.left = "50%"
//     rootContainer.style.transform = "translate(-50%, -50%)"
//     rootContainer.style.zIndex = "9999"
//     document.body.appendChild(rootContainer)
//     resolve(rootContainer)
//   })

// const CentralSearch: FC<PlasmoCSUIProps> = () => {
//   const [searchText, setSearchText] = useState("")
//   const [isVisible, setIsVisible] = useState(true)
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     // 这里可以添加搜索逻辑
//     console.log("Searching for:", searchText)
//   }

//   return (
//     <div
//       className={`fixed inset-0 flex flex-col items-center bg-black bg-opacity-50 backdrop-blur-sm z-50 ${
//         isVisible ? "block" : "hidden"
//       }`}
//     >
//       <div className="mt-[20vh] p-5 bg-white rounded-lg shadow-md">
//         <input
//           type="text"
//           placeholder="Search..."
//           className="w-72 p-2 text-base border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>
//     </div>
//   )
// }

// export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
//   createRootContainer
// }) => {
//   const rootContainer = await createRootContainer()
//   const root = createRoot(rootContainer)
//   root.render(<CentralSearch />)
// }

// export default CentralSearch

export {}