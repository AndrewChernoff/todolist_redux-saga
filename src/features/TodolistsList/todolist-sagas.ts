import { call, put, takeEvery } from "redux-saga/effects";
import { setAppStatusAC } from "../../app/app-reducer";
import { ResponseType, TodolistType, todolistsAPI } from "../../api/todolists-api";
import { changeTodolistEntityStatusAC, removeTodolistAC, setTodolistsAC } from "./todolists-reducer";
import { handleServerNetworkErrorSaga } from "../../utils/error-utils";

const FETCH_TODOLISTS_ACTION = 'FETCH_TODOLISTS_ACTION'
const REMOVE_TODOLIST_ACTION = 'REMOVE_TODOLIST_ACTION'

export function* fetchTodolistsWorkerSaga() {
    yield put(setAppStatusAC('loading'));
    try {
        const response:  ResponseType<TodolistType[]> = yield call(todolistsAPI.getTodolists);
        yield put(setTodolistsAC(response.data));
        yield put(setAppStatusAC('succeeded'));
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error as any);
    }
}

export const fetchTodolists = () => ({type: FETCH_TODOLISTS_ACTION})


export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolist>) {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        yield put(setAppStatusAC('loading'))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'))
        const res: ResponseType = yield call(todolistsAPI.deleteTodolist, action.todolistId)
            
        yield put(removeTodolistAC(action.todolistId))
                //скажем глобально приложению, что асинхронная операция завершена
        yield put(setAppStatusAC('succeeded'))
}

export const removeTodolist = (todolistId: string) => ({type: REMOVE_TODOLIST_ACTION, todolistId})


export function* todolistWatcherSagas() {
    yield takeEvery(FETCH_TODOLISTS_ACTION, fetchTodolistsWorkerSaga)
    yield takeEvery(REMOVE_TODOLIST_ACTION, removeTodolistWorkerSaga)
}

