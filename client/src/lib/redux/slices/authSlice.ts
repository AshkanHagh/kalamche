import { User } from "@/types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialState = {
  user: User | null | undefined
  accessToken: string | null | undefined
}

type SetCredentialsPayload = {
  user: User
  accessToken: string
}

const initialState: InitialState = {
  user: undefined,
  accessToken: undefined
}

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setCredentials: (
      state,
      { payload }: PayloadAction<SetCredentialsPayload>
    ) => {
      const { accessToken, user } = payload
      state.user = user
      state.accessToken = accessToken
    },
    logout: (state) => {
      state.accessToken = null
      state.user = null
    }
  }
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer
