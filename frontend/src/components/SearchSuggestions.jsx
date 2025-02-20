import React from "react";

function SearchSuggestions({ suggestions, activeIndex, onSelect }) {
  return (
    <ul
      className="list-group position-absolute w-100"
      style={{ zIndex: 999, top: "100%" }}
    >
      {suggestions.map((item, index) => (
        <li
          key={item.id}
          className={`list-group-item ${index === activeIndex ? "active" : ""}`}
          onMouseDown={() => onSelect(item)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

export default SearchSuggestions;
