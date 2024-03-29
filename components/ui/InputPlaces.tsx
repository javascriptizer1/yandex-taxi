import React, { FC, useEffect, useRef, useState } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import cn from "classnames";
import { FiSearch } from "react-icons/fi";
import { Coords } from "google-map-react";
import { useAppSelector } from '../../hooks';

interface IInputPlaces {
  cb: (address: string, location: Coords) => void;
  type: "from" | "to";
}

const InputPlaces: FC<IInputPlaces> = ({ cb, type }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const setFocus = () => inputRef?.current?.focus();

  const isFrom = type === "from";

  useEffect(() => {
    if (isFrom) setFocus();
  }, [isFrom]);

  const [address, setAddress] = useState("");

  const handleSelect = (address: string) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((location) => {
        cb(address, location);
        setAddress(address);
      })
      .catch((err) => console.error("Error", err));
  };

  const { travelTime } = useAppSelector((state) => state.taxi);

  return (
    <PlacesAutocomplete
      value={address}
      onChange={setAddress}
      onSelect={handleSelect}
      onError={(err) => console.log("Error", err)}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div
          className={cn("shadow-lg", {
            "mb-5": isFrom,
          })}
        >
          <div
            className="py-3 px-5 bg-white rounded-lg flex items-center"
            style={
              suggestions.length
                ? {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                : {}
            }
            onClick={setFocus}
          >
            <FiSearch
              color={isFrom ? "#ffbc00" : "#615F5D"}
              className="mr-3"
              size={26}
            />
            <input
              {...getInputProps({
                ref: inputRef,
                placeholder: isFrom ? "Откуда?" : "Куда?",
                className: "outline-none w-full text-gray-800",
              })}
            />
            {!isFrom && (
              <div className="absolute right-5 text-sm text-gray-400">
                {travelTime
                  ? `${travelTime} min. (${Math.ceil(travelTime / 60)} h.)`
                  : "- min."}
              </div>
            )}
          </div>

          <div
            className={cn(
              "absolute w-full h-0 overflow-y-auto rounded-b-lg z-10",
              {
                "h-48": suggestions.length || loading,
              }
            )}
          >
            {loading && <div className="p-2 bg-white">Loading...</div>}

            {suggestions.map((suggestion, idx) => (
              <div
                {...getSuggestionItemProps(suggestion, {
                  className: cn("cursor-pointer p-3", {
                    "bg-gray-100": suggestion.active,
                    "bg-white": !suggestion.active,
                  }),
                })}
                key={`loc ${idx}`}
              >
                <span>{suggestion.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default InputPlaces;
