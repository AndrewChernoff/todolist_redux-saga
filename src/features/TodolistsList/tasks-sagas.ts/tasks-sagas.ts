import { call, put, takeEvery } from "redux-saga/effects"
import { setAppStatusAC } from "../../../app/app-reducer"
import { AxiosResponse } from "axios"
import { GetTasksResponse, todolistsAPI } from "../../../api/todolists-api"
import { addTaskAC, removeTaskAC, setTasksAC } from "../tasks-reducer"
import { handleServerAppError, handleServerAppErrorSaga, handleServerNetworkError, handleServerNetworkErrorSaga } from "../../../utils/error-utils"

export function* fetchTasksWorkerSaga(action:ReturnType<typeof fetchTasks>) {
    yield put(setAppStatusAC('loading'))
    const data: GetTasksResponse = yield call(todolistsAPI.getTasks, action.todolistId)
    
            const tasks = data.items
            yield put(setTasksAC(tasks, action.todolistId))
            yield put(setAppStatusAC('succeeded'))
}

export const fetchTasks = (todolistId: string) => ({type: 'FETCH_TASKS', todolistId})


export function* removeTaskWorkerSaga (action:ReturnType<typeof removeTaskAction>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
            yield put(removeTaskAC(action.taskId, action.todolistId))
}

export const removeTaskAction = (taskId: string, todolistId: string) => ({type: 'REMOVE_TASK_ACTION', taskId, todolistId})



export function* addTaskWorkerSaga(action: ReturnType<typeof addTask>): any  {
    yield put(setAppStatusAC('loading'))

    try {
        const res: any = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        
            if (res.data.resultCode === 0) {
                const task = res.data.data.item                
                yield put(addTaskAC(task))
                yield put(setAppStatusAC('succeeded'))
            } else {
                yield* handleServerAppErrorSaga(res.data);
            }        
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error as any)

    }
}

export const addTask = (title: string, todolistId: string) => ({type: 'ADD_TASK', todolistId, title})

export function* tasksWatcherSagas() {
    yield takeEvery('FETCH_TASKS', fetchTasksWorkerSaga)
    yield takeEvery('REMOVE_TASK_ACTION', removeTaskWorkerSaga)
    yield takeEvery('ADD_TASK', addTaskWorkerSaga)
}