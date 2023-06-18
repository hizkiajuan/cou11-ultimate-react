import React from 'react';
import ReactDOM from 'react-dom/client';
import {pizzaData} from './data';
import './index.css';

function Pizza(props) {
  const {
    name,
    ingredients,
    photoName,
    price,
    soldOut,
  } = props;

  return (
    <div className={`pizza ${soldOut && 'sold-out'}`}>
      <img src={photoName} alt={photoName}/>
      <div>
        <h3>{name}</h3>
        <p>{ingredients}</p>
        <span>{price + 3}</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <h1>Fast React Pizza Co.</h1>
    </header>
  );
}
function Menu() {
  return (
    <main className="menu">
      <h2>Our menu</h2>
      <div className="pizzas">
        {
          pizzaData.map((pizza) => (
            <Pizza
              name={pizza.name}
              ingredients={pizza.ingredients}
              photoName={pizza.photoName}
              price={pizza.price}
              soldOut={pizza.soldOut}
            />
          ))
        }
      </div>
    </main>
  );
}
function Footer() {
  const hour = new Date().getHours();
  const openHour = 12;
  const closeHour = 22;
  const isOpen = openHour <= hour && hour <= closeHour;

  return (
    <footer className="footer">
      {
        isOpen ? (
          <Order closeHour={closeHour} />
        ) : (
          <p>We're happy to welcome you between {openHour}:00 and {closeHour}:00.</p>
        )
      }
    </footer>
  );
}

function Order(props) {
  return (
    <div className="order">
      <p>We're open until {props.closeHour}:00. Come visit us or order online.</p>
      <button className="btn">Order</button>
    </div>
  );
}

function App() {
  return (
    <div className="container">
      <Header/>
      <Menu/>
      <Footer/>
    </div>
  );
}

// React v18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);

// React before v18
// React.render(<App />, document.getElementById('root'));
