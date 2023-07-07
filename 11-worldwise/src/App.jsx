import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Pricing from "./pages/Pricing.jsx";
import Product from "./pages/Product.jsx";
import Login from "./pages/Login.jsx";
import AppLayout from "./pages/AppLayout.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import CityList from "./components/CityList.jsx";
import CountryList from "./components/CountryList.jsx";
import City from "./components/City.jsx";
import Form from "./components/Form.jsx";
import {CitiesProvider} from "./contexts/CitiesContext.jsx";
import {AuthProvider} from "./contexts/FakeAuthContext.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <CitiesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/product" element={<Product />} />
            <Route path="/login" element={<Login />} />

            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>

              {/* redirection */}
              <Route index element={<Navigate replace to="/app/cities" />} />

              <Route path="/app/cities" element={<CityList />} />
              <Route path="/app/cities/:id" element={<City />} />
              <Route path="/app/countries" element={<CountryList />} />
              <Route path="/app/form" element={<Form />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </CitiesProvider>
    </AuthProvider>
  );
}
