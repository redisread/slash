
import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";


interface SearchBarProps {
    // 在这里定义你的属性
  }

const SearchBar:React.FC<SearchBarProps> = (props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const testData = [
    {
      title: "test",
      description: "test",
    },
    {
      title: "test1",
      description: "test1",
    },
  ];

  useEffect(() => {
    if (query.length > 0) {
        setResults(testData);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Search..."
        />
        <Dropdown results={results} />
      </div>
    </div>
  );
};

export default SearchBar;