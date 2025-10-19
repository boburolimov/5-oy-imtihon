import { changeLocalData, localData } from "./local-data.js";

export function deleteElementLocal( id) {
  const result = localData.filter((el) => el.id != id);
  changeLocalData(result )
}

export function addElementLocal (newData) {
    const result = [newData, ...localData]
    changeLocalData(result)
}

export function editElementLocal( editedData) {
  const result = localData.map((el) => {
    if(el.id === editedData.id) {
      return editedData
    }else {
      return el
    }
  })
  changeLocalData(result)
}