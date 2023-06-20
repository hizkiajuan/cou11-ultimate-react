import {useState} from "react";
import {Button} from "./Button";

export function FormAddFriend({onAddFriend}) {
  const API_URL = 'https://i.pravatar.cc/48';
  const [name, setName] = useState('');
  const [image, setImage] = useState(API_URL);

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !image) return;

    const id = crypto.randomUUID();

    onAddFriend({
      name,
      image: `${image}?u=${id}`,
      balance: 0,
      id,
    });

    setName('');
    setImage(API_URL);
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>🤼 Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>🍰 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <Button>Add</Button>
    </form>
  );
}
