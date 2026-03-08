
import React, { useState, useEffect, useRef } from 'react';
import { getBuildings } from '../../api/buildings';

export default function BuildingSelector({ selectedId, onChange }) {
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    getBuildings().then(list => {
      if (!isMounted) return;
      setBuildings(list);
      if (!selectedId && list.length) {
        onChange(list[0].id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedId, onChange]);

  // Filter buildings by address only, trimming whitespace from address
  // Remove all whitespace (including newlines) from address for matching
  const normalize = str => (str || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const filtered = search.trim() === ''
    ? buildings
    : buildings.filter(b => normalize(b.address).includes(normalize(search)));


  // Always show search value in input, do not override with selected building

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className="relative w-full max-w-xs" ref={inputRef}>
      <input
        type="text"
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-400"
        placeholder="Search building address..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        autoComplete="off"
      />
      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">No buildings found</div>
          ) : (
            filtered.map(b => (
              <div
                key={b.id}
                className={`px-3 py-2 cursor-pointer hover:bg-green-700/20 text-sm ${b.id === selectedId ? 'bg-green-700/10 text-green-300' : 'text-white'}`}
                onClick={() => {
                  setDropdownOpen(false);
                  setSearch(''); // Clear search after selection
                  onChange(b.id);
                }}
              >
                {b.address}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

