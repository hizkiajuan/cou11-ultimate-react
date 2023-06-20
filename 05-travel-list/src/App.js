import {useState} from "react";
import Logo from "./Logo";
import Form from "./Form";
import PackingList from "./PackingList";
import Stats from "./Stats";
export default function App() {
  const [items, setItems] = useState([]);

  function handleAddItem(item) {
    // don't use `push`, as React state should be immutable!
    setItems((items) => [...items, item]);
  }

  function handleDeleteItem(id) {
    // remember: never mutate the state!
    setItems((items) => items.filter((item) => item.id !== id));
  }

  function handleToggleItem(id) {
    setItems((items) => items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          packed: !item.packed,
        };
      }
      return item;
    }));
  }

  function handleClearItems() {
    const confirmed = window.confirm('Are you sure you want to delete all items?');

    if(confirmed) setItems([]);
  }

  return (
    <div className="app">
      <Logo />

      {/* recall: React uses one-way data flow */}
      <Form onAddItem={handleAddItem} />

      {/* recall: React uses one-way data flow */}
      <PackingList
        items={items}
        onDeleteItem={handleDeleteItem}
        onToggleItem={handleToggleItem}
        onClearItems={handleClearItems}
      />

      <Stats items={items} />
    </div>
  );
}
