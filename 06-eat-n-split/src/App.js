import {useState} from "react";
import {FriendList} from "./FriendList";
import {Button} from "./Button";
import {FormAddFriend} from "./FormAddFriend";
import {FormSplitBill} from "./FormSplitBill";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

export default function App() {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  function handleSelection(friend) {
    setSelectedFriend((currentFriend) => currentFriend?.id === friend.id ? null : friend);
    setShowAddFriend(false);
  }

  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) => ({
        ...friend,
        balance: friend.id === selectedFriend.id ? (friend.balance + value) : friend.balance,
      }))
    );
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={handleSelection}
        />

        { showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} /> }

        <Button onClick={() => setShowAddFriend((v) => !v)}>
          { showAddFriend ? 'Close' : 'Add friend'}
        </Button>
      </div>

      { selectedFriend && <FormSplitBill
        key={selectedFriend.id}
        selectedFriend={selectedFriend}
        onSplitBill={handleSplitBill}
      /> }
    </div>
  );
}
