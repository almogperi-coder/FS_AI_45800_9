import { configureStore } from "@reduxjs/toolkit"
import { favoritesReducer } from "./favoritesReducer"
import { jokesReducer } from "./jokesReducer"
import { settingsReducer } from "./settingsReducer"

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    jokes: jokesReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
