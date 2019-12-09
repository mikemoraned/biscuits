import { Machine, assign, interpret, spawn } from "xstate";

const cities = [
  {
    name: "San Francisco",
    location: { latitude: 37.774929, longitude: -122.419418 }
  },
  {
    name: "Jerusalem",
    location: { latitude: 31.768318, longitude: 35.213711 }
  },
  { name: "Berlin", location: { latitude: 52.520008, longitude: 13.404954 } },
  { name: "London", location: { latitude: 51.507351, longitude: -0.127758 } },
  {
    name: "Edinburgh",
    location: { latitude: 55.953251, longitude: -3.188267 }
  },
  { name: "New York", location: { latitude: 40.73061, longitude: -73.935242 } },
  { name: "Budapest", location: { latitude: 47.497913, longitude: 19.040236 } }
];

function invokeFetchCities() {
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(cities);
    }, 2000);
  });
}

function invokeFetchCity(context) {
  const { name } = context;
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      const entry = cities.find(city => {
        return city.name === name;
      });
      if (entry) {
        resolve(entry);
      } else {
        reject(`no city with name: ${name}`);
      }
    }, 500);
  });
}

export const mainMachine = Machine({
  id: "main",
  initial: "loading",
  context: {
    cities: [],
    selectedName: null,
    cityService: null
  },
  states: {
    loading: {
      invoke: {
        id: "fetch-cities",
        src: invokeFetchCities,
        onDone: {
          target: "loaded",
          actions: assign({
            cities: (_, event) => event.data
          })
        }
      }
    },
    loaded: {},
    selected: {}
  },
  on: {
    SELECT: {
      target: "selected",
      actions: assign((context, event) => {
        const name = event.name;
        const cityService = spawn(createCityMachine(name)).onTransition(
          state => {
            console.log(`${name}: Transition to state:`);
            console.log(state.value);
          }
        );

        return {
          ...context,
          selectedName: name,
          cityService
        };
      })
    }
  }
});

export const createCityMachine = cityName => {
  return Machine({
    id: "city",
    initial: "loading",
    context: {
      name: cityName,
      city: null
    },
    states: {
      loading: {
        invoke: {
          id: "fetch-city",
          src: invokeFetchCity,
          onDone: {
            target: "loaded",
            actions: assign({
              city: (_, event) => ({
                name: cityName,
                location: event.data.location
              })
            })
          }
        }
      },
      loaded: {}
    }
  });
};

export const service = interpret(mainMachine)
  .onTransition(state => {
    console.log("Transition to state:");
    console.log(state.value);
  })
  .start();
