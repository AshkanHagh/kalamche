import { createSlice } from "@reduxjs/toolkit"

const authenticationSlice = createSlice({
  name: "auth",
  initialState: { username: "shahin" },
  reducers: {}
})

export default authenticationSlice.reducer
