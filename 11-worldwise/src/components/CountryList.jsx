import styles from "./CountryList.module.css"
import Spinner from "./Spinner.jsx";
import CountryItem from "./CountryItem.jsx";
import Message from "./Message.jsx";
import {useCities} from "../contexts/CitiesContext.jsx";

export default function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />

  if (!cities.length) return <Message message="Add your first city by clicking on a city on the map" />

  const countries = cities.reduce((acc, curr) => {
    if (!acc.map((el) => el.country).includes(curr.country)) {
      return [
        ...acc,
        {
          id: curr.id,
          emoji: curr.emoji,
          country: curr.country,
        }
      ];
    }

    return acc;
  }, []);

  return (
    <ul className={styles.countryList}>
      {
        countries.map((country) => <CountryItem key={country.id} country={country} />)
      }
    </ul>
  );
}
