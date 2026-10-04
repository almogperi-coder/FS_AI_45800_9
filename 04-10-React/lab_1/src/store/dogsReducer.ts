import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import type { DogBreed } from "../pages/DogsPage/dog-type"
import { getDogBreedsApi } from "../pages/DogsPage/dogs-api"
import type { RootState } from "./store"

export type DogsStatus = "idle" | "pending" | "succeeded" | "failed"

export type DogsState = {
  breeds: DogBreed[]
  status: DogsStatus
  error: string
  page: number
  totalRecords: number
  requestId: string
}

const initialState: DogsState = {
  breeds: [],
  status: "idle",
  error: "",
  page: 1,
  totalRecords: 0,
  requestId: "",
}

function toErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return "Failed to load dog breeds"
}

export const loadDogs = createAsyncThunk<
  Awaited<ReturnType<typeof getDogBreedsApi>>,
  number,
  { state: RootState; rejectValue: string }
>("dogs/loadDogs", async (page, { rejectWithValue }) => {
  try {
    return await getDogBreedsApi(page)
  } catch (err) {
    return rejectWithValue(toErrorMessage(err))
  }
})

const dogsSlice = createSlice({
  name: "dogs",
  initialState,
  reducers: {
    clearDogsError(state) {
      state.error = ""
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadDogs.pending, (state, action) => {
        state.status = "pending"
        state.error = ""
        state.requestId = action.meta.requestId
      })
      .addCase(loadDogs.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) {
          return
        }

        state.status = "succeeded"
        state.breeds = action.payload.breeds
        state.page = action.payload.page
        state.totalRecords = action.payload.totalRecords
        state.error = ""
      })
      .addCase(loadDogs.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) {
          return
        }

        state.status = "failed"
        state.breeds = []
        state.error = action.payload ?? action.error.message ?? "Failed to load dog breeds"
      })
  },
})

export const { clearDogsError } = dogsSlice.actions
export const dogsReducer = dogsSlice.reducer
