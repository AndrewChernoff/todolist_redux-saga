import { call, put } from "redux-saga/effects"
import { initializeAppWorkerSaga, setAppInitializedAC } from "./app-reducer"
import { MeRequestType, ResponseType, authAPI } from "../api/todolists-api"
import { AxiosResponse } from "axios"
import { setIsLoggedInAC } from "../features/Login/auth-reducer"

test('app initialize', () => {
    const gen = initializeAppWorkerSaga()
    let result = gen.next()
    
    expect(result.value).toEqual(call(authAPI.me))

    const fakeResponse: AxiosResponse<MeRequestType>/* MeRequestType */ = {
        data: {
            resultCode: 0,
            messages: [],
            data: {
              id: 6,
              email: 'email.com',
              login: 'adssdf',
            },
          },
          status: 200,
          statusText: '',
          headers: {},
          config: {},
    }
    result = gen.next(fakeResponse)

    expect(result.value).toEqual(put(setIsLoggedInAC(true)))

}) 