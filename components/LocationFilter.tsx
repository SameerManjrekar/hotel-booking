"use client";

import { useEffect, useState } from "react";
import Container from "./Container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useLocation from "@/hooks/useLocation";
import { ICity, IState } from "country-state-city";
import qs from "query-string";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

const LocationFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [states, setStates] = useState<IState[]>([]);
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<ICity[]>([]);

  const { getAllCountries, getCountryStates, getStateCities } = useLocation();

  useEffect(() => {
    const countryStates = getCountryStates(country);
    if (countryStates) {
      setStates(countryStates);
      setState("");
      setCity("");
    }
  }, [country]);

  useEffect(() => {
    const countryStateCities = getStateCities(country, state);

    if (countryStateCities) {
      setCities(countryStateCities);
      setCity("");
    }
  }, [country, state]);

  useEffect(() => {
    if (country === "" && state === "" && city === "") {
      router.push("/");
    }

    let currentQuery: any = {};
    if (searchParams) {
      currentQuery = qs.parse(searchParams.toString());
    }

    if (country) {
      currentQuery = {
        ...currentQuery,
        country,
      };
    }
    if (state) {
      currentQuery = {
        ...currentQuery,
        state,
      };
    }
    if (city) {
      currentQuery = {
        ...currentQuery,
        city,
      };
    }

    if (country === "" && currentQuery.country) {
      delete currentQuery.country;
    }

    if (state === "" && currentQuery.state) {
      delete currentQuery.state;
    }
    if (city === "" && currentQuery.city) {
      delete currentQuery.city;
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: currentQuery,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  }, [country, state, city]);

  const handleClear = () => {
    router.push("/");
    setCountry("");
    setState("");
    setCity("");
  };

  return (
    <Container>
      <div className="flex gap-2 md:gap-4 items-center justify-center text-sm">
        <div>
          <Select value={country} onValueChange={(value) => setCountry(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {getAllCountries?.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={state} onValueChange={(value) => setState(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.length &&
                states?.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={city} onValueChange={(value) => setCity(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.length &&
                cities?.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleClear} variant="outline">
          Clear Filters
        </Button>
      </div>
    </Container>
  );
};

export default LocationFilter;
