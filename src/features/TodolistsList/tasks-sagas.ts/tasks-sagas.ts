import { call, put, select, takeEvery } from "redux-saga/effects"
import { setAppStatusAC } from "../../../app/app-reducer"
import { AxiosResponse } from "axios"
import { GetTasksResponse, ResponseType, TaskType, UpdateTaskModelType, todolistsAPI } from "../../../api/todolists-api"
import { UpdateDomainTaskModelType, addTaskAC, removeTaskAC, setTasksAC, updateTaskAC } from "../tasks-reducer"
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


export function* updateTaskWorkerSaga (action: ReturnType<typeof updateTask>) {
        const task: TaskType = yield select(state => state.tasks[action.todolistId].find((t: TaskType) => t.id === action.taskId));

        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...action.domainModel
        }

        const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        try {
            if (res.data.resultCode === 0) {
                yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
            } else {
                yield* handleServerAppErrorSaga(res.data);
            }
        } catch (error) {
            yield* handleServerNetworkErrorSaga(error as any)
        }   
    }

export const updateTask = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => ({type: 'UPDATE_TASK_ACTION', taskId, domainModel, todolistId })


export function* tasksWatcherSagas() {

    yield takeEvery('FETCH_TASKS', fetchTasksWorkerSaga)
    yield takeEvery('REMOVE_TASK_ACTION', removeTaskWorkerSaga)
    yield takeEvery('ADD_TASK', addTaskWorkerSaga)
    yield takeEvery('UPDATE_TASK_ACTION', updateTaskWorkerSaga)
}