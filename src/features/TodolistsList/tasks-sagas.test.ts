import { call, put } from "redux-saga/effects";
import { addTaskWorkerSaga, fetchTasksWorkerSaga } from "./tasks-sagas.ts/tasks-sagas"
import { setAppErrorAC, setAppStatusAC } from "../../app/app-reducer";
import { GetTasksResponse, TaskPriorities, TaskStatuses, TaskType, todolistsAPI } from "../../api/todolists-api";
import { setTasksAC } from "./tasks-reducer";



test('fetch tasks', () => {
    const gen = fetchTasksWorkerSaga({type: 'FETCH_TASKS', todolistId:'todolistId'});

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    const fakeResponse: GetTasksResponse = {
            error: '',
            totalCount: 1,
            items: [
                { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
            ]
    }

    expect(gen.next().value).toEqual(call(todolistsAPI.getTasks, 'todolistId'))
    expect(gen.next(fakeResponse).value).toEqual(put(setTasksAC(fakeResponse.items, 'todolistId')))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})


test('add task', () => {
    const gen = addTaskWorkerSaga({type: 'ADD_TASK', todolistId: 'todolistId', title: 'new title'})

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.createTask, 'todolistId', 'new title'))
    expect(gen.throw({message: 'some error'}).value).toEqual(put(setAppErrorAC('some error')))
})