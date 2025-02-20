import { useState } from "react";

export const useAutocomplete = (searchFn) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleQueryChange = (value) => {
    setQuery(value);
    if (value) {
      searchFn(value)
        .then((data) => setSuggestions(data))
        .catch((err) => console.error("Ошибка при поиске:", err));
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e, onSelect) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0) {
          onSelect(suggestions[activeIndex]);
        }
      }
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    activeIndex,
    handleQueryChange,
    handleKeyDown,
    setSuggestions,
    setActiveIndex,
  };
};
